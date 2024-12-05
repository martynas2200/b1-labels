import * as ang from "angular"

declare const angular: ang.IAngularStatic

export class ModalService {
  $uibModal: any
  $rootScope: any

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
  }): Promise<void> {
    const modalScope = this.$rootScope.$new(true)

    // Add custom properties to the scope if provided
    if (config.scopeProperties) {
      Object.assign(modalScope, config.scopeProperties)
    }

    const modalInstance = this.$uibModal.open({
      animation: true,
      template: config.template,
      scope: modalScope,
      size: config.size || 'lg',
      backdrop: config.backdrop || 'static',
    })

    modalScope.closeModal = () => {
      modalInstance.close()
      modalScope.$destroy()
      config.onClose?.()
    }
  }
}
