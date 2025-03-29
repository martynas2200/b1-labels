import type * as ang from "angular";

declare const angular: ang.IAngularStatic

export class ModalService {
  $uibModal: any
  $rootScope: any
  modalInstance: any = null
  constructor() {
    const injector = angular.element(document.body).injector()
    this.$uibModal = injector.get('$uibModal')
    this.$rootScope = injector.get('$rootScope')
  }

  async showModal(config: {
    template: string,
    scopeProperties?: Record<string, any>,
    size?: string,
    backdrop?: string,
    onClose?: () => void,
    windowClass?: string,
  }): Promise<any> {
    const modalScope = this.$rootScope.$new(true)

    if (config.scopeProperties) {
      Object.defineProperties(
        modalScope,
        Object.entries(config.scopeProperties).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: {
            get: () => config.scopeProperties![key],
            set: (v: any) => config.scopeProperties![key] = v,
            enumerable: true,
            configurable: true
          }
        }), {})
      )
    }

    this.modalInstance = this.$uibModal.open({
      animation: true,
      template: config.template,
      scope: modalScope,
      size: config.size || 'lg',
      backdrop: config.backdrop || 'static',
      windowClass: config.windowClass || '',
    })

    modalScope.closeModal = () => {
      this.modalInstance.close()
      modalScope.$destroy()
      config.onClose?.()
    }

    return this.modalInstance.result
  }

}
