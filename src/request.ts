import { i18n } from './i18n'
import { type item } from './item'
import { UINotification } from './ui-notification'
export class Request {
  items: Record<string, item> = {}
  baseUrl: string = 'https://www.b1.lt'
  path: string = '/reference-book/items/search'
  csrfToken: string
  headers: Record<string, string>
  notifier: UINotification

  constructor (notifier: UINotification) {
    const csrfTokenElement: HTMLMetaElement | null = document.querySelector('meta[name="csrf-token"]')
    this.csrfToken = csrfTokenElement != null ? csrfTokenElement.content : ''
    this.notifier = notifier
    this.headers = {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-GB,en;q=0.9,lt-LT;q=0.8,lt;q=0.7,en-US;q=0.6',
      'content-type': 'application/json;charset=UTF-8',
      origin: this.baseUrl,
      referer: this.baseUrl,
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-requested-with': 'XMLHttpRequest',
      'x-csrf-token': this.csrfToken,
      cookie: ''
    }
  }

  async fetchData (method: string, path: string, body: Record<string, any>): Promise<any> {
    if (this.csrfToken === '') {
      console.error('CSRF token is missing')
      this.notifier.error('CSRF token is missing')
      return
    }
    const pathParts = path.split('/')
    pathParts.pop()
    this.headers.referer = `${this.baseUrl}${pathParts.join('/')}`
    this.getCookies()
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.headers,
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        return data
      } else {
        console.error('Request failed with status:', response.status)
        this.notifier.error({ title: i18n('error'), message: response.statusText })
      }
    } catch (error) {
      console.error('Error:', error)
      this.notifier.error('Error: ' + error)
    }
  }

  private getCookies (): void {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim())
    cookies.forEach(cookie => {
      const [name, value] = cookie.split('=')
      if (['_fbp', 'YII_CSRF_TOKEN', 'b1-device_id', 'b1-session_id', 'b1-use-cookies', 'b1-wss_srv', '_ga', 'b1-ref_url', '_ga_F9V3KM1JRX'].includes(name.trim())) {
        this.headers.cookie = (this.headers.cookie.length > 0) ? `${this.headers.cookie}; ${name}=${value}` : `${name}=${value}`
      }
    })
  }

  isItDigits (barcode: string): boolean {
    return /^\d+$/.test(barcode)
  }

  removeLeadingZeros(barcode: string): string {
    return barcode.replace(/^0+/, '');
  }

  async getItem (barcode: string): Promise<any> {
    if (!this.isItDigits(barcode)) {
      this.notifier.error('Invalid barcode')
      return null
    }
    if (Object.keys(this.items).includes(barcode)) {
      const retrievedAt = this.items[barcode].retrievedAt
      if (retrievedAt != null && barcode.length > 10 && new Date().getTime() - retrievedAt.getTime() < 10000) {
        return JSON.parse(JSON.stringify(this.items[barcode]))
      } else if (retrievedAt != null && barcode.length < 10 && new Date().getTime() - retrievedAt.getTime() < 30000) {
        return JSON.parse(JSON.stringify(this.items[barcode]))
      }
    }
    // Prepare the request body
    const body = {
      pageSize: 20,
      filters: {
        groupOp: 'AND',
        rules: { barcode: { data: this.removeLeadingZeros(barcode), field: 'barcode', op: 'eq' } }
      },
      allSelected: false,
      asString: '',
      page: 1
    }

    const data = await this.fetchData('POST', this.path, body)
    if (data == null || data.data[0] == null) {
      return null
    }
    data.data[0].retrievedAt = new Date()
    this.items[barcode] = data.data[0]
    return data.data[0]
  }

  async getItemsByName (name: string): Promise<any[]> {
    if (name.length < 3) {
      return []
    }
    const body = {
      pageSize: 20,
      filters: {
        groupOp: 'AND',
        rules: {
          name: { data: name, field: 'name', op: 'cn' },
          isActive: { data: true, field: 'isActive', op: 'eq' }
        }
      },
      allSelected: false,
      asString: '',
      page: 1
    }
    const data = await this.fetchData('POST', this.path, body)
    // push all the items to the items array
    data.data.forEach((item: item) => {
      // unnecessary check
      if (item.barcode != null) {
        this.items[item.barcode] = item
      }
    })
    return data.data
  }
  async saveItem(id: string, data: Record<string, any>): Promise<boolean> {
    // Check if the id is provided and it consists of digits only
    if (!this.isItDigits(id)) {
      this.notifier.error(i18n('invalidId'));
      return false;
    }
    const response = await this.fetchData('POST', `/reference-book/items/update?id=${id}`, data);
    
    if (response.code === 200) {
      this.notifier.success({
        title: i18n('itemUpdated'),
        message: i18n('newPriceIs') + data.priceWithVat,
        delay: 15000
      })
    } else {
      this.notifier.error({
        title: i18n('failedToUpdateItem'),
        message: response.message
      })
    } 
    return response.code === 200 
}
  async createItem (data: Record<string, any>): Promise<boolean> {
    const response = await this.fetchData('POST', '/reference-book/items/create', data);
    if (response.code === 200) {
      this.notifier.success(i18n('itemCreated'));
    } else {
      this.notifier.error({
        title: i18n('failedToCreateItem'),
        message: response.message
      })
    }
    return response.code === 200
  }

  async getSales (operationTypeName: string): Promise<any> {
    const body = {
      sort: { saleDate: 'desc' },
      page: 1,
      pageSize: 20,
      allSelected: false,
      asString: '',
      filters: {
        rules: {
          operationTypeName: { data: operationTypeName, field: 'operationTypeName', op: 'cn' }
        }
      }
    }
    const path = '/warehouse/light-sales/search'
    return this.fetchData('POST', path, body)
  }

  public clearCache() {
    const nItems = Object.keys(this.items).length
    this.items = {}
    this.notifier.info({ 
      title: i18n('cacheCleared'), 
      message: nItems + i18n('nItemsRemoved')
    })
  }
}
