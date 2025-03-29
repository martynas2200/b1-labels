import { ModalService } from '../services/modal'
import { type PackagedItem, type Item } from '../types/item'
import { Request } from '../services/request'
import { UINotification } from '../services/notification'
import { i18n } from '../services/i18n'
import { WeightLabelModal } from './weightLabelModal'

export class ItemDetailsModal {
  constructor(private modalService: ModalService, private notification: UINotification, private req: Request, private weightModal: WeightLabelModal) {}

  show(item: PackagedItem): void {
    const filteredItem = Object.fromEntries(
      Object.entries(item).filter(([key, value]) => value !== null && !key.toString().toLowerCase().includes('id') && !key.toString().toLowerCase().includes('account'))
    )

    const resultString = Object.entries(filteredItem)
      .map(([key, value]) => `
        <div class="row col-xs-12">
          <div class="col-sm-5" >${i18n(key)}:</div>
          <div class="col-sm-7" ${key.includes('price') ? 'ng-click="changePrice(item)"' : ''}>${value}</div>
        </div>
      `)
      .join('')
    const modalTemplate = `
      <div class="modal-header">
        <h5 class="modal-title inline">${i18n('itemDetails')}</h5>
        <button type="button" class="close" aria-label="Close" ng-click="closeModal()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="container width-auto">${resultString}</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-sm btn-pink" type="button" ng-click="tagModal(item)"><i class="fa fa-tag"></i> ${i18n('label')}</button>
        <button type="button" class="btn btn-sm" ng-click="closeModal()">${i18n('close')}</button>
      </div>
    `
    void this.modalService.showModal({
      template: modalTemplate,
      scopeProperties: {
        item,
        changePrice: this.quickPriceChange.bind(this, item),
        tagModal: (item: Item) => {
          void this.weightModal.show(item)
        }
      }
    })
  }

  async quickPriceChange(item: PackagedItem): Promise<void> {
    const price = prompt(i18n('enterNewPrice'), (item.priceWithVat ?? 0).toString())
    if (price == null || item.id == null) {
      this.notification.info(i18n('error'))
      return
    }
    const data = new Object() as Item
    data.id = item.id.split('-')[0]
    data.isActive = true
    data.priceWithVat = parseFloat(price.replace(',', '.'))
    if (data.priceWithVat <= 0) {
      this.notification.error(i18n('missingPrice'))
      return
    }
    data.priceWithoutVat = (data.priceWithVat / 1.21)
    data.priceWithoutVat = Math.round((data.priceWithoutVat + Number.EPSILON) * 10000) / 10000
    item.priceWithVat = data.priceWithVat
    item.priceWithoutVat = data.priceWithoutVat
    await this.req.saveItem(data.id, data)
  }

}
