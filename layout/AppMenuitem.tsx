"use client";
import React, { memo, useContext, useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Ripple } from "primereact/ripple";
import { classNames } from "primereact/utils";
import { LayoutContext } from "./context/layoutcontext";
import { MenuContext } from "./context/menucontext";
import { useSubmenuOverlayPosition } from "./hooks/useSubmenuOverlayPosition";
import { AppMenuItemProps } from "../types/layout";

const AppMenuitem = (props: AppMenuItemProps) => {
  const { activeMenu, setActiveMenu } = useContext(MenuContext);
  const {
    isSlim,
    isSlimPlus,
    isHorizontal,
    isDesktop,
    setLayoutState,
    layoutState,
    layoutConfig,
    setLoading,
  } = useContext(LayoutContext);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const submenuRef = useRef(null);
  const menuitemRef = useRef(null);
  const item = props.item;
  const key = props.parentKey
    ? props.parentKey + "-" + props.index
    : String(props.index);
  const isActiveRoute = item.to && pathname === item.to;
  const active =
    activeMenu === key || !!(activeMenu && activeMenu.startsWith(key + "-"));

  // True whenever the current page belongs to this root item's children — persists after submenu closes
  const hasActiveChild = useMemo(() => {
    if (!props.root || !item.items) return false;
    const check = (items: typeof item.items): boolean =>
      items.some(child => (child.to && pathname === child.to) || (child.items && check(child.items)));
    return check(item.items);
  }, [pathname, item.items, props.root]);

  useSubmenuOverlayPosition({
    target: menuitemRef.current,
    overlay: submenuRef.current,
    container:
      menuitemRef.current &&
      menuitemRef.current.closest(".layout-menu-container"),
    when:
      props.root &&
      active &&
      (isSlim() || isSlimPlus() || isHorizontal()) &&
      isDesktop(),
  });

  useEffect(() => {
    if (layoutState.resetMenu) {
      setActiveMenu("");
      setLayoutState((prevLayoutState) => ({
        ...prevLayoutState,
        resetMenu: false,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutState]);

  useEffect(() => {
    if (!(isSlim() || isHorizontal() || isSlimPlus()) && isActiveRoute) {
      setActiveMenu(key);
    }
  }, [layoutConfig]);

  useEffect(() => {
    const url = pathname + searchParams.toString();

    const onRouteChange = (url) => {
      if (
        !(isSlim() || isHorizontal() || isSlimPlus()) &&
        item.to &&
        item.to === url
      ) {
        setActiveMenu(key);
      }
    };
    onRouteChange(url);
  }, [pathname, searchParams]);

  const itemClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    //avoid processing disabled items
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    // navigate with hover
    if (props.root && (isSlim() || isHorizontal() || isSlimPlus())) {
      const isSubmenu =
        event.currentTarget.closest(
          ".layout-root-menuitem.active-menuitem > ul",
        ) !== null;
      if (isSubmenu)
        setLayoutState((prevLayoutState) => ({
          ...prevLayoutState,
          menuHoverActive: true,
        }));
      else
        setLayoutState((prevLayoutState) => ({
          ...prevLayoutState,
          menuHoverActive: !prevLayoutState.menuHoverActive,
        }));
    }

    //execute command
    if (item.command) {
      item.command({ originalEvent: event, item: item });
    }

    // toggle active state
    if (item.items) {
      setActiveMenu(active ? props.parentKey : key);

      if (props.root && (isSlim() || isHorizontal() || isSlimPlus())) {
        setLayoutState((prevLayoutState) => ({
          ...prevLayoutState,
          overlaySubmenuActive: !active,
        }));
      }
    } else {
      if (!isDesktop()) {
        setLayoutState((prevLayoutState) => ({
          ...prevLayoutState,
          staticMenuMobileActive: !prevLayoutState.staticMenuMobileActive,
        }));
      }

      if (isSlim() || isHorizontal() || isSlimPlus()) {
        setLayoutState((prevLayoutState) => ({
          ...prevLayoutState,
          menuHoverActive: false,
        }));
      }

      if (item.to && !item.items && pathname !== item.to) {
        setLoading(true);
      }

      setActiveMenu(key);
    }
  };

  const onMouseEnter = () => {};

  const onMenuItemMouseLeave = () => {};

  const onMenuItemMouseEnter = () => {};

  const subMenu =
    item.items && item.visible !== false ? (
      <ul ref={submenuRef}>
        {item.items.map((child, i) => {
          return (
            <AppMenuitem
              item={child}
              index={i}
              className={child.badgeClass}
              parentKey={key}
              key={child.label + i}
            />
          );
        })}
      </ul>
    ) : null;

  const isRootAndVertical =
    props.root && !(isSlim() || isHorizontal() || isSlimPlus());
  const shouldHideRootLink = isRootAndVertical && item.items;

  return (
    <li
      ref={menuitemRef}
      className={classNames({
        "layout-root-menuitem": props.root,
        "active-menuitem": active,
        "active-parent-menuitem": hasActiveChild,
      })}
      onMouseEnter={onMenuItemMouseEnter}
      onMouseLeave={onMenuItemMouseLeave}
    >
      {props.root && item.visible !== false && item.label && (
        <div className="layout-menuitem-root-text">{item.label}</div>
      )}

      {!shouldHideRootLink &&
        (!item.to || item.items) &&
        item.visible !== false ? (
        <>
          {item.to ? (
            <Link
              href={item.to}
              onClick={(e) => itemClick(e as any)}
              className={classNames(item.class, "p-ripple tooltip-target", {
                "active-route": isActiveRoute,
                'border-b-2 border-blue-500': active && !props.root
              })}
              target={item.target}
              data-pr-tooltip={item.label}
              data-pr-disabled={true}
              tabIndex={0}
              onMouseEnter={onMouseEnter}
            >
              <i className={classNames("layout-menuitem-icon", item.icon)}></i>
              <span className="layout-menuitem-text">{item.label}</span>
              {item.items && (
                <i className="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
              )}
              <Ripple />
            </Link>
          ) : (
            <a
              href={item.url}
              onClick={(e) => itemClick(e)}
              className={classNames(item.class, "p-ripple tooltip-target")}
              target={item.target}
              data-pr-tooltip={item.label}
              data-pr-disabled={true}

              tabIndex={0}
              onMouseEnter={onMouseEnter}
            >
              <i className={classNames("layout-menuitem-icon", item.icon)}></i>
              <span className="layout-menuitem-text">{item.label}</span>
              {item.items && (
                <i className="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
              )}
              <Ripple />
            </a>
          )}
        </>
      ) : null}

      {!shouldHideRootLink &&
        item.to &&
        !item.items &&
        item.visible !== false ? (
        <>
          <Link
            href={item.to}
            onClick={(e) => itemClick(e as any)}
            className={classNames(item.class, "p-ripple", {
              "active-route": isActiveRoute,
              'border-b-2 border-blue-500': active && !props.root
            })}
            tabIndex={0}
            onMouseEnter={onMouseEnter}
            target={item.target}
          >
            {(isSlim() || isSlimPlus()) && (
              <i className={classNames("layout-menuitem-icon", item.icon)}></i>
            )}
            <span className="layout-menuitem-text">{item.label}</span>
            {item.items && (
              <i className="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
            )}
            <Ripple />
          </Link>
        </>
      ) : null}
      {subMenu}
    </li>
  );
};

export default memo(AppMenuitem);
