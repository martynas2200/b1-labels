import { i18n } from '../services/i18n'
import { Request } from '../services/request'
import { ModalService } from '../services/modal'

declare const GM: any

export class MarkdownModal {
  request: Request
  modalService: ModalService
  tableData: any[] = []
  saleItems: any[] = []

  constructor(request: Request) {
    this.request = request
    this.modalService = new ModalService()
  }

  async show(): Promise<void> {
    if (this.tableData.length === 0) {
      await this.loadData()
    }

    void this.modalService.showModal({
      template: `
        <div class="modal-header">
          <h4 class="modal-title pull-left">${i18n('markdowns')}</h4>
          <div class="pull-right">
            <button ng-click="goToURL()" class="btn btn-sm btn-purple" type="button">
              <i class="fa fa-external-link"></i> ${i18n('weeklyReports')}
            </button>
            <button ng-click="closeModal()" class="btn btn-sm btn-white" type="button">
              <i class="fa fa-times"></i> ${i18n('close')}
            </button>
          </div>
        </div>
        <div class="modal-body">
          <div ng-if="tableData.length === 0" class="alert alert-info">{{ noDataMessage }}</div>
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>${i18n('number')}</th>
                <th>${i18n('date')}</th>
                <th>${i18n('discount')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr ng-repeat="row in tableData">
                <td>{{row.series}} {{row.number}}</td>
                <td>{{row.saleDate}}</td>
                <td>{{row.discount}}</td>
                <td>
                  <button class="btn btn-xs btn-block btn-primary" ng-click="showSaleItems(row.id, row.saleDate)">
                    ${i18n('show')}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
      scopeProperties: {
        tableData: this.tableData,
        noDataMessage: this.tableData.length ? '' : i18n('loading'),
        closeModal: () => this.modalService.modalInstance.close(),
        goToURL: this.goToURL.bind(this),
        showSaleItems: this.showSaleItems.bind(this),
      },
    })
  }

  async loadData(): Promise<void> {
    const sales = await this.request.getSales('nur')
    if (!sales) {
      this.tableData = []
    } else {
      this.tableData = sales.data.map((sale: any) => ({
        id: sale.id,
        series: sale.series,
        number: sale.number,
        saleDate: sale.saleDate,
        discount: sale.discount,
      }))
    }
  }

  async showSaleItems(id: string, date: string): Promise<void> {
    const items = await this.request.getSaleItems(id)
    this.saleItems =
      items?.data
        .map((item: any) => ({
          itemId: item.itemId,
          virtualName: item.virtualName,
          quantity: item.quantity,
          total: item.sumWithoutVat + item.vat,
          discount: item.discount,
          discountRate: item.discountRate,
          virtualUnit: item.virtualUnit,
        }))
        .filter((item: any) => item.discount < 0) || []

    void this.modalService.showModal({
      template: `
        <div class="modal-header">
          <button type="button" class="close" ng-click="closeModal()">
            <span>&times;</span>
          </button>
          <h4 class="modal-title">${i18n('markdowns')} <span class="text-primary">${date}</span></h4>
        </div>
        <div class="modal-body">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>${i18n('name')}</th>
                <th>${i18n('quantity')}</th>
                <th>${i18n('total')}</th>
                <th>${i18n('discount')}</th>
                <th>${i18n('discountRate')}</th>
              </tr>
            </thead>
            <tbody>
              <tr ng-repeat="item in saleItems">
                <td>{{item.itemId}}</td>
                <td>{{item.virtualName}}</td>
                <td>{{item.quantity}} {{item.virtualUnit.measurementUnitName}}</td>
                <td>{{item.total.toFixed(2)}}</td>
                <td>{{item.discount}}</td>
                <td>{{item.discountRate}}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" ng-click="closeModal()">${i18n('close')}</button>
        </div>
      `,
      scopeProperties: {
        saleItems: this.saleItems,
        closeModal: () => this.modalService.modalInstance.close(),
      },
    })
  }

  async goToURL(): Promise<void> {
    const url = await GM.getValue('url', '')
    if (url !== '') {
      window.open(url, '_blank')
    }
  }
}
