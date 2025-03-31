import { i18n } from './i18n'
import { type Item } from '../types/item'
import { type FilterRules, type RequestBody } from '../types/request'
import { AngularServiceLocator } from './angular-service-locator'
import { UINotification } from './notification'

export class Request {
  items: Record<string, Item> = {}
  baseUrl: string = 'https://www.b1.lt'
  path: string = '/reference-book/items/search'
  csrfToken: string
  headers: Record<string, string>
  turnstileService: {
    render: () => Promise<void>,
  }

  constructor(private notifier: UINotification) {
    this.turnstileService = AngularServiceLocator.getService('turnstileService')

    const csrfTokenElement: HTMLMetaElement | null = document.querySelector(
      'meta[name="csrf-token"]',
    )
    this.csrfToken = csrfTokenElement != null ? csrfTokenElement.content : ''
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
      cookie: '',
    }
  }

  // build the request body
  buildRequestBody(rules: FilterRules, pageSize: number = 20): RequestBody {
    return {
      pageSize,
      filters: {
        groupOp: 'AND',
        rules,
      },
      allSelected: false,
      asString: '',
      page: 1,
    }
  }

  async fetchData(
    method: string,
    path: string,
    body: Record<string, any>,
  ): Promise<any> {
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
        body: JSON.stringify(body),
      })

      if (response.ok) {
        return await response.json()
      } else if (
        'challenge' === response.headers.get('cf-mitigated') ||
        response.status === 403
      ) {
        if (await this.handleChallenge()) {
          console.info('Challenge handled, repeat the request')
          return await this.fetchData(method, path, body)
        }
      } else {
        console.error('Request failed with status:', response.status)
        this.notifier.error({
          title: i18n('error'),
          message: response.statusText,
        })
      }
    } catch (error: any) {
      console.error('Error:', error)
      this.notifier.error('Error: ' + error)
    }
  }

  getCookies(): void {
    const cookies = document.cookie.split(';').map((cookie) => cookie.trim())
    cookies.forEach((cookie) => {
      const [name, value] = cookie.split('=')
      if (
        [
          'YII_CSRF_TOKEN',
          'b1-device_id',
          'b1-session_id',
          'b1-use-cookies',
          'b1-wss_srv',
          'b1-ref_url',
          'cf_clearance',
          '_ga',
        ].includes(name.trim())
      ) {
        this.headers.cookie =
          this.headers.cookie.length > 0
            ? `${this.headers.cookie}; ${name}=${value}`
            : `${name}=${value}`
      }
    })
  }

  isItDigits(barcode: string): boolean {
    return /^\d+$/.test(barcode)
  }

  /**
   * Get item by barcode
   * @param barcode - barcode of the item
   * @returns item object
   * @example
   * const item = await req.getItem('1234567890123')
   */
  async getItem(barcode: string): Promise<any> {
    if (!this.isItDigits(barcode)) {
      this.notifier.error('Invalid barcode')
      return null
    }
    if (Object.keys(this.items).includes(barcode)) {
      const retrievedAt = this.items[barcode].retrievedAt
      if (
        retrievedAt != null &&
        barcode.length > 10 &&
        new Date().getTime() - retrievedAt.getTime() < 30000
      ) {
        return { ...this.items[barcode] }
      } else if (
        retrievedAt != null &&
        barcode.length < 10 &&
        new Date().getTime() - retrievedAt.getTime() < 60000
      ) {
        return { ...this.items[barcode] }
      }
    }

    // Prepare the request body
    const rules: FilterRules = {
      barcode: {
        data: barcode,
        field: 'barcode',
        op: barcode[0] === '0' ? 'cn' : 'eq',
      },
    }
    const body = this.buildRequestBody(rules)
    const data = await this.fetchData('POST', this.path, body)
    if (data == null || data.data[0] == null) {
      return null
    }
    data.data[0].retrievedAt = new Date()
    this.items[barcode] = data.data[0]
    // if there more than one item with the same barcode, return the first one, and notify the user
    if (data.data.length > 1) {
      this.notifier.warning({
        title: i18n('multipleItemsFound'),
        delay: 20000,
        message:
          i18n('barcode') +
          ' ' +
          barcode +
          ' ' +
          i18n('found') +
          ' ' +
          data.data.length +
          ' ' +
          i18n('items'),
      })
    }
    return data.data[0]
  }
  async getRecentlyModifiedItems(): Promise<Item[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const body = this.buildRequestBody({
      isActive: { data: true, field: 'isActive', op: 'eq' },
      modifiedAt: {
        data: today.toISOString().split('T')[0],
        field: 'modifiedAt',
        op: 'gt',
      },

    }, 20)
    body.sort = { modifiedAt: 'desc' } // most recent changes first
    const items = await this.fetchData('POST', this.path, body)
    if (items && items.data) {
      items.data.forEach((item: Item) => {
        item.retrievedAt = new Date()
        this.items[item.barcode] = item
      })
    }
    return items.data || []
  }

  async getItemsByIds(ids: string[]): Promise<Item[]> {
    const rules: FilterRules = {
      id: { data: ids, field: 'id', op: 'in' },
    }
    const body = this.buildRequestBody(rules, 20)
    const items = await this.fetchData('POST', this.path, body)
    if (items && items.data) {
      items.data.forEach((item: Item) => {
        item.retrievedAt = new Date()
        this.items[item.barcode] = item
      })
    }
    return items.data || []
  }

  async saveItem(id: string, data: Record<string, string | number | boolean>): Promise<boolean> {
    // Check if the id is provided and it consists of digits only
    if (!this.isItDigits(id)) {
      this.notifier.error(i18n('invalidId'))
      return false
    }
    const response = await this.fetchData(
      'POST',
      `/reference-book/items/update?id=${id}`,
      data,
    )
    // TODO: make it generic
    if (response.code === 200) {
      this.notifier.success({
        title: i18n('itemUpdated'),
        message: i18n('newPriceIs') + ' ' + data.priceWithVat, //TODO: use string interpolation
        delay: 15000,
      })
    } else {
      this.notifier.error({
        title: i18n('failedToUpdateItem'),
        message: response.message,
      })
    }
    return response.code === 200
  }
  async quickPriceChange(item: Item): Promise<boolean> {
    const price = prompt(i18n('enterNewPrice'), (item.priceWithVat ?? 0).toString())
    if (price == null || item.id == null) {
      this.notifier.info(i18n('error'))
      return false
    }
    const data = new Object() as Record<string, string | number | boolean>
    data.isActive = true
    data.id = item.id
    data.priceWithVat = parseFloat(price.replace(',', '.'))
    if (data.priceWithVat <= 0) {
      this.notifier.error(i18n('missingPrice'))
      return false
    }
    data.priceWithoutVat = (data.priceWithVat / 1.21)
    data.priceWithoutVat = Math.round((data.priceWithoutVat + Number.EPSILON) * 10000) / 10000
    item.priceWithVat = data.priceWithVat
    item.priceWithoutVat = data.priceWithoutVat
    return this.saveItem(data.id, data)
  }

  async createItem(data: Record<string, string | number | boolean>): Promise<boolean> {
    const response = await this.fetchData(
      'POST',
      '/reference-book/items/create',
      data,
    )
    if (response.code === 200) {
      this.notifier.success(i18n('itemCreated'))
      setTimeout(() => {
        void this.saveItem(response.data.id, { isActive: true })
      }, 400)
    } else {
      this.notifier.error({
        title: i18n('failedToCreateItem'),
        message: response.message,
      })
    }
    return response.code === 200
  }

  async getSales(operationTypeName: string): Promise<any> {
    const rules: FilterRules = {
      operationTypeName: {
        data: operationTypeName,
        field: 'operationTypeName',
        op: 'cn',
      },
    }
    const body = this.buildRequestBody(rules, 20)
    body.sort = { saleDate: 'desc' }
    const path = '/warehouse/light-sales/search'
    return this.fetchData('POST', path, body)
  }

  getSaleItems(lightSaleId: string): Promise<any> {
    const rules: FilterRules = {
      lightSaleId: { field: 'lightSaleId', op: 'eq', data: lightSaleId },
    }
    const body = this.buildRequestBody(rules, -1)
    return this.fetchData('POST', '/warehouse/light-sale-items/search', body)
  }

  async handleChallenge(): Promise<boolean> {
    try {
      await this.turnstileService.render()
      console.info('Turnstile challenge passed!')
      return true
    } catch (error) {
      console.error('Turnstile challenge failed.', error)
      return false
    }
  }
}
