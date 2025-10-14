import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

type PermissionConfig = {
  resource: string;
  action: string | string[];
};

@Directive({
  selector: '[appHasPermission],[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private resource?: string;
  private actions: string[] = [];
  private elseTemplate?: TemplateRef<any>;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$.subscribe(() => this.updateView());
    this.updateView();
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  @Input('appHasPermission')
  set appHasPermission(config: PermissionConfig | undefined) {
    if (config) {
      this.resource = config.resource;
      this.actions = Array.isArray(config.action) ? config.action : [config.action];
    } else {
      this.resource = undefined;
      this.actions = [];
    }
    this.updateView();
  }

  @Input('hasPermission')
  set hasPermission(resource: string | undefined) {
    this.resource = resource || undefined;
    this.updateView();
  }

  @Input('hasPermissionActions')
  set hasPermissionActions(actions: string | string[] | undefined) {
    if (actions === undefined || actions === null) {
      this.actions = [];
    } else {
      this.actions = Array.isArray(actions) ? actions : [actions];
    }
    this.updateView();
  }

  @Input('appHasPermissionElse')
  set appHasPermissionElse(template: TemplateRef<any> | undefined) {
    this.elseTemplate = template || undefined;
    this.updateView();
  }

  @Input('hasPermissionElse')
  set hasPermissionElse(template: TemplateRef<any> | undefined) {
    this.elseTemplate = template || undefined;
    this.updateView();
  }

  private updateView(): void {
    this.viewContainer.clear();

    if (!this.resource || this.actions.length === 0) {
      if (this.elseTemplate) {
        this.viewContainer.createEmbeddedView(this.elseTemplate);
      }
      return;
    }

    const hasPermission = this.actions.some(action =>
      this.authService.hasPermission(this.resource!, action)
    );

    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else if (this.elseTemplate) {
      this.viewContainer.createEmbeddedView(this.elseTemplate);
    }
  }
}

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit {
  @Input() appHasRole!: UserRole | UserRole[];
  @Input() appHasRoleElse?: TemplateRef<any>;

  constructor(
    private authService: AuthService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    const roles = Array.isArray(this.appHasRole) ? this.appHasRole : [this.appHasRole];
    const hasRole = this.authService.hasRole(roles);

    this.viewContainer.clear();

    if (hasRole) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else if (this.appHasRoleElse) {
      this.viewContainer.createEmbeddedView(this.appHasRoleElse);
    }
  }
}