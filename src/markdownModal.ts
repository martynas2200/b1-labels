import { i18n } from './i18n'
import { Request } from './request'

declare const angular: any
declare const GM: any

export class MarkdownModal {
  request: Request
  $uibModal: any
  modalScope: any
  instances: any = []

  constructor(request: Request) {
    this.request = request
    const injector = angular.element(document.body).injector()
    const $rootScope = injector.get('$rootScope')
    this.$uibModal = injector.get('$uibModal')
    this.modalScope = $rootScope.$new(true)

    this.initializeScope()
  }

  initializeScope(): void {
    this.modalScope.title = i18n('markdowns')
    this.modalScope.tableData = []
    this.modalScope.loadData = this.loadData.bind(this)
    this.modalScope.showSaleItems = this.showSaleItems.bind(this)
    this.modalScope.noDataMessage = i18n('loading')
    this.modalScope.closeModal = this.closeModal.bind(this)
    this.modalScope.goToURL = this.goToURL.bind(this)
  }

  open(): void {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: `
        <div class="modal-header">
        <h4 class="modal-title pull-left">${i18n('markdowns')}</h4>
        <div class="pull-right">
        <button ng-click="goToURL()" class="btn btn-sm btn-purple" type="button"><i class="fa fa-external-link"></i> ${i18n('weeklyReports')}</button>
        <button ng-click="closeModal()" class="btn btn-sm btn-white" type="button"><i class="fa fa-times"></i> ${i18n('close')}</button>
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
      scope: this.modalScope,
      size: 'lg',
    })
    this.instances.push(modalInstance)
    if (this.modalScope.tableData.length === 0) {
      void this.loadData()
    }
  }

  async loadData(): Promise<void> {
    const sales = await this.request.getSales('nur')
    if (!sales) {
      this.modalScope.tableData = []
      this.modalScope.noDataMessage = i18n('noDataFound')
    } else {
      this.modalScope.tableData = sales.data.map((sale: any) => ({
        id: sale.id,
        series: sale.series,
        number: sale.number,
        saleDate: sale.saleDate,
        discount: sale.discount,
      }))
    }
    this.modalScope.$apply()
  }

  async showSaleItems(id: string, date: string): Promise<void> {
    const items = await this.request.getSaleItems(id)

    const modalInstance = this.$uibModal.open({
      animation: true,
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
      scope: this.modalScope,
      size: 'lg',
    })

    this.modalScope.saleItems =
      items?.data.map((item: any) => ({
        itemId: item.itemId,
        virtualName: item.virtualName,
        quantity: item.quantity,
        total: item.sumWithoutVat + item.vat,
        discount: item.discount,
        discountRate: item.discountRate,
        virtualUnit: item.virtualUnit,
      })) || []
    //filter out items with 0 discount
    this.modalScope.saleItems = this.modalScope.saleItems.filter(
      (item: any) => item.discount < 0,
    )
    this.instances.push(modalInstance)
  }

  closeModal(): void {
    if (this.instances.length > 0) {
      this.instances.pop().close()
    }
  }
  
  async goToURL(): Promise<void> {
      const url = await GM.getValue('url', '')
      if (url !== '') {
        window
          .open(url, '_blank')
    }
  }
}
