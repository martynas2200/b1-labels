import { ModalService } from '../services/modal'
import { LabelGenerator } from '../labelGenerator'
import { i18n } from '../services/i18n'
import { type Item } from '../types/item'
import { type LabelType } from '../types/label'

export class LabelTypeModal {
  modal: ModalService
  lg: LabelGenerator
  labelTypes: LabelType[] = ['normal', 'fridge', 'half', 'barcodeOnly']
  fakeItems: Partial<Item>[] = [
    {
      name: 'Whiskey BLACK RAM, 40%, 0,7 l',
      barcode: '3800032070302',
      measurementUnitName: 'vnt.',
      measurementUnitCanBeWeighed: false,
      priceWithVat: 14.29,
      isActive: true,
      isRefundable: true,
    },
    {
      name: 'Cookies BARNI Milk, 30 g',
      barcode: '5906747318345',
      measurementUnitName: 'vnt.',
      measurementUnitCanBeWeighed: false,
      priceWithVat: 0.5,
      isActive: true,
      isRefundable: true,
    },
    {
      name: 'Coca-Cola, 0,5 l',
      barcode: '4779036770016',
      measurementUnitName: 'vnt.',
      measurementUnitCanBeWeighed: false,
      priceWithVat: 1.99,
      isActive: true,
      packageCode: '1100',
      isRefundable: true,
    },
  ]

  constructor(private type?: LabelType) {
    this.modal = new ModalService()
    this.lg = new LabelGenerator()
  }

  open(): Promise<LabelType> {
    return new Promise((resolve, reject) => {
      void this.modal.showModal({
        template:
          this.lg.createStyleElement().outerHTML +
          `
        <div class="modal-header">
          <button type="button" class="close" ng-click="closeModal()">
            <span>&times;</span>
          </button>
          <h4 class="modal-title">{{ i18n('chooseLabelType') }}</h4>
        </div>
        <div class="modal-body">
          <div class="alert-xs alert-info">{{ i18n('chooseLabelTypeDescription') }}</div>
          <div class="list-group">
            <div class="list-group-item" 
            ng-repeat="labelType in labelTypes track by $index" 
            ng-init="labelPreviews[labelType] = getLabelPreview(labelType)" 
            ng-class="{active: current === labelType}" 
            ng-click="selectLabelType(labelType)" 
            style="cursor: pointer;">
            <div class="list-group-item-heading">
            <span class="glyphicon" ng-class="{'glyphicon-check': current === labelType, 'glyphicon-unchecked': current !== labelType}"></span>
               {{ i18n(labelType) }}
               </div>
              <div class="label-preview" ng-bind-html="labelPreviews[labelType]"></div>
            </div>
        </div>
      `,
        scopeProperties: {
          labelTypes: this.labelTypes,
          current: this.type,
          fakeItems: this.fakeItems,
          selectLabelType: (x: LabelType) => {
            this.type = x
            resolve(x)
            this.modal.modalInstance.close()
          },
          lg: this.lg,
          i18n,
          getLabelPreview: (labelType: LabelType) => {
            return this.lg.generateLabel(
              this.fakeItems[Math.floor(Math.random() * this.fakeItems.length)],
              labelType,
            ).outerHTML
          },
          closeModal: () => {
            reject(new Error('Modal closed without selection'))
            this.modal.modalInstance.close()
          },
        },
      })
    })
  }
}
