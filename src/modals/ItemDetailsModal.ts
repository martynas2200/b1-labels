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
        changePrice: (item: PackagedItem) => {
          void this.req.quickPriceChange(item)
        },
        tagModal: (item: Item) => {
          void this.weightModal.show(item)
        }
      }
    })
  }


}
