import { ModalService } from '../services/modal'
import { UINotification } from '../services/notification'
import { i18n } from '../services/i18n'
import { type Item } from '../types/item'
import { WeightLabelModal } from './weightLabelModal'
import { LabelGenerator } from '../labelGenerator'
import { type LabelType } from '../types/label'
import { LabelTypeModal } from './labelTypeModal'
import { LabelerController } from '../labelerController'

export class ReferenceBookItemsModal {
  constructor(
    private modalService: ModalService,
    private notification: UINotification,
    private weight?: WeightLabelModal,
    private controller?: LabelerController,
  ) {}

  show(): Promise<void> {
    return this.modalService.showModal({
      template: `
        <div class="modal-body">
          <div ng-controller="ReferenceBookItems as c" class="row">
            <div class="col-xs-12">
              <div class="margin-bottom-5 row sticky row-no-gutters">
                <button ng-show="!c.grid.config.isLoading" 
                        ng-disabled="selected(c.grid) == 0" 
                        type="button" 
                        class="btn btn-sm btn-purple" 
                        ng-click="print(c.grid.provider.getSelected())">
                  <i class="fa fa-fw fa-print"></i> ${i18n('print')}
                </button>
                <button ng-show="!c.grid.config.isLoading && weight"
                        ng-disabled="!isWeighted(c.grid)" 
                        type="button" 
                        class="btn btn-sm btn-pink" 
                        ng-click="weightLabel(c.grid.provider.getSelected())">
                  <i class="fa fa-fw fa-balance-scale"></i> ${i18n('weightLabel')}
                </button>
                <button ng-show="!c.grid.config.isLoading && controller != undefined"
                        ng-disabled="selected(c.grid) == 0" 
                        type="button" 
                        class="btn btn-sm btn-primary" 
                        ng-click="proccessItem(c.grid.provider.getSelected())">
                  <i class="fa fa-fw fa-plus"></i> ${i18n('add')}
                </button>
                <button ng-show="!c.grid.config.isLoading && controller != undefined"
                        type="button" 
                        class="btn btn-sm btn-white" 
                        ng-click="openTypeModal()">
                   <i class="fa fa-caret-down"></i>  ${i18n('type')}
                </button>
                <button class="btn btn-sm pull-right" ng-click="closeModal()">
                  <i class="fa fa-fw fa-times"></i> ${i18n('close')}
                </button>
              </div>
              <extd-grid
                config="c.grid.config"
                filter="c.grid.filter"
                data="c.grid.data">
              </extd-grid>
            </div>
          </div>
        </div>`,
      scopeProperties: {
        weight: this.weight,
        controller: this.controller,
        weightLabel: (a: Item[]) => {
          if (!a || a.length !== 1 || !a[0].measurementUnitCanBeWeighed) {
            this.notification.error(i18n('weightedItem') + '?')
            return
          }
          void this.weight?.show(a[0])
        },
        print: async (e: Item[]) => {
          if (e.length < 1) {
            this.notification.error(i18n('noItemsSelected'))
            return
          }
          let type = await this.controller?.getType()
          if (type === undefined) {
            await new LabelTypeModal().open().then((x: LabelType) => {
              type = x
            })
          }
          void new LabelGenerator(e, type)
        },
        selected: (a: any) => a.provider.getSelected().length,
        isWeighted: (a: any) => {
          const selected = a.provider.getSelected()
          return selected.length === 1 && selected[0].measurementUnitCanBeWeighed
        },
        proccessItem: (a: Item[]) => {
          if (!a || a.length < 1) {
            this.notification.error(i18n('noItemsSelected'))
            return
          } else if (this.controller === undefined) {
            this.notification.error(i18n('error'))
            return
          }
          a.forEach((i: Item) => {
            void this.controller?.processItem(i, true)
          })
          
        },
        openTypeModal: () => {
          void this.controller?.openTypeModal()
        }
      },
      size: 'ext',
    })
  }
}
