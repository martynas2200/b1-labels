import { i18n } from '../services/i18n'
import { ModalService } from '../services/modal'

export class TempFileListModal {
  constructor(private modalService: ModalService) {}

  async show(): Promise<void> {
    await this.modalService.showModal({
      template: `
        <div class="modal-body">
          <temp-file-list type-id="{{typeId}}" open-for-select="openForSelect"></temp-file-list>
        </div>
        <div class="modal-footer">
          <button class="btn" ng-click="closeModal()">
            <i class="fa fa-times"></i>${i18n('close')}
          </button>
        </div>`,
      scopeProperties: {
        typeId: null,
        openForSelect: false,
      },
    })
  }
}
