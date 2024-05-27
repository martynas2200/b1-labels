import { type item } from './item'
export class Request {
  items: Record<string, item> = {}
  baseUrl: string = 'https://www.b1.lt'
  path: string = '/reference-book/items/search'
  csrfToken: string
  headers: Record<string, string>

  constructor () {
    const csrfTokenElement: HTMLMetaElement | null = document.querySelector('meta[name="csrf-token"]')
    this.csrfToken = csrfTokenElement != null ? csrfTokenElement.content : ''

    this.headers = {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-GB,en;q=0.9,lt-LT;q=0.8,lt;q=0.7,en-US;q=0.6',
      'content-type': 'application/json;charset=UTF-8',
      origin: this.baseUrl,
      referer: `${this.baseUrl}/reference-book/items`,
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-requested-with': 'XMLHttpRequest',
      'x-csrf-token': this.csrfToken,
      cookie: ''
    }
  }

  async fetchData (method: string, path: string, body: any = {}): Promise<any> {
    if (this.csrfToken === '') {
      console.error('CSRF token is missing')
      return
    }
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
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  getCookies (): void {
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

  async getItem (barcode: string): Promise<any> {
    if (!this.isItDigits(barcode)) {
      return []
    }
    if (Object.keys(this.items).includes(barcode)) {
      return this.items[barcode]
    }
    // Prepare the request body
    const body = {
      pageSize: 20,
      filters: {
        groupOp: 'AND',
        rules: { barcode: { data: barcode, field: 'barcode', op: 'eq' } }
      },
      allSelected: false,
      asString: '',
      page: 1
    }

    const data = await this.fetchData('POST', this.path, body)
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
        rules: { name: { data: name, field: 'name', op: 'cn' } }
      },
      allSelected: false,
      asString: '',
      page: 1
    }
    const data = await this.fetchData('POST', this.path, body)
    // data = data.data;
    // push all the items to the items array
    data.data.forEach((item: item) => {
      // unnecessary check
      if (item.barcode != null) {
        this.items[item.barcode] = item
      }
    })
    return data.data
  }
}
