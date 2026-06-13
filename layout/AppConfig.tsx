'use client';

import React from 'react';
import { classNames } from 'primereact/utils';
import { PrimeReactContext } from 'primereact/api';
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { LayoutContext } from './context/layoutcontext';
import { Sidebar } from 'primereact/sidebar';
import { useContext, useEffect } from 'react';
import { AppConfigProps, ColorScheme } from '../types/layout';

const AppConfig = (props: AppConfigProps) => {
    const { layoutConfig, setLayoutConfig, layoutState, setLayoutState, isSlim, isHorizontal, isSlimPlus } = useContext(LayoutContext);
    const { setRipple, changeTheme } = useContext(PrimeReactContext);
    const scales = [12, 13, 14, 15, 16];

    const componentThemes = [
        { name: 'blue', color: '#0F8BFD' },
        { name: 'green', color: '#0BD18A' },
        { name: 'magenta', color: '#EC4DBC' },
        { name: 'orange', color: '#FD9214' },
        { name: 'purple', color: '#873EFE' },
        { name: 'red', color: '#FC6161' },
        { name: 'teal', color: '#00D0DE' },
        { name: 'yellow', color: '#EEE500' }
    ];

    useEffect(() => {
        if (isSlim() || isHorizontal() || isSlimPlus()) {
            setLayoutState((prevState) => ({ ...prevState, resetMenu: true }));
        }
    }, [layoutConfig.menuMode]);

    const changeInputStyle = (e: RadioButtonChangeEvent) => {
        setLayoutConfig((prevState) => ({ ...prevState, inputStyle: e.value }));
    };

    const changeRipple = (e: InputSwitchChangeEvent) => {
        setRipple(e.value);
        setLayoutConfig((prevState) => ({ ...prevState, ripple: e.value }));
    };

    const changeMenuMode = (e: RadioButtonChangeEvent) => {
        setLayoutConfig((prevState) => ({ ...prevState, menuMode: e.value }));
    };

    const changeColorScheme = (colorScheme: ColorScheme) => {
        changeTheme(layoutConfig.colorScheme, colorScheme, 'theme-link', () => {
            setLayoutConfig((prevState) => ({ ...prevState, colorScheme }));
        });
    };

    const _changeTheme = (theme: string, color: string) => {
        changeTheme(layoutConfig.theme, theme, 'theme-link', () => {
            setLayoutConfig((prevState) => ({ ...prevState, theme, themeColor: color }));
        });
    };

    const getComponentThemes = () => {
        return (
            <div className="flex flex-wrap row-gap-3">
                {componentThemes.map((theme, i) => {
                    return (
                        <div key={i} className="w-3">
                            <a
                                className="cursor-pointer p-link w-2rem h-2rem border-circle flex-shrink-0 flex align-items-center justify-content-center"
                                style={{ cursor: 'pointer', backgroundColor: theme.color }}
                                onClick={() => _changeTheme(theme.name, theme.color)}
                            >
                                {layoutConfig.theme === theme.name && (
                                    <span className="check flex align-items-center justify-content-center">
                                        <i className="pi pi-check" style={{ color: 'white' }}></i>
                                    </span>
                                )}
                            </a>
                        </div>
                    );
                })}
            </div>
        );
    };

    const componentThemesElement = getComponentThemes();

    const decrementScale = () => {
        setLayoutConfig((prevState) => ({
            ...prevState,
            scale: prevState.scale - 1
        }));
    };

    const incrementScale = () => {
        setLayoutConfig((prevState) => ({
            ...prevState,
            scale: prevState.scale + 1
        }));
    };

    const applyScale = () => {
        document.documentElement.style.fontSize = layoutConfig.scale + 'px';
    };

    useEffect(() => {
        applyScale();
    }, [layoutConfig.scale]);

    return (
        <div id="layout-config">

            <Sidebar
                visible={layoutState.configSidebarVisible}
                position="right"
                style={{ width: "16rem", backgroundColor: "#ffffff", borderLeft: "1px solid #e2e8f0" }}
                onHide={() =>
                    setLayoutState((prevState) => ({
                        ...prevState,
                        configSidebarVisible: false
                    }))
                }
            >
                <h5>Themes</h5>
                {componentThemesElement}

                <h5>Scale</h5>
                <div className="flex align-items-center">
                    <Button text rounded icon="pi pi-minus" onClick={decrementScale} className=" w-2rem h-2rem mr-2" disabled={layoutConfig.scale === scales[0]}></Button>
                    <div className="flex gap-2 align-items-center">
                        {scales.map((s, i) => {
                            return (
                                <i
                                    key={i}
                                    className={classNames('pi pi-circle-fill text-300', {
                                        'text-primary-500': s === layoutConfig.scale
                                    })}
                                ></i>
                            );
                        })}
                    </div>
                    <Button text rounded icon="pi pi-plus" onClick={incrementScale} className=" w-2rem h-2rem ml-2" disabled={layoutConfig.scale === scales[scales.length - 1]}></Button>
                </div>

                <h5>Color Scheme</h5>

                <div className="field-radiobutton">
                    <RadioButton name="colorScheme" value="light" checked={layoutConfig.colorScheme === 'light'} inputId="theme3" onChange={(e) => changeColorScheme(e.value)}></RadioButton>
                    <label htmlFor="theme3">Light</label>
                </div>

                <div className="field-radiobutton">
                    <RadioButton name="colorScheme" value="dark" checked={layoutConfig.colorScheme === 'dark'} inputId="theme1" onChange={(e) => changeColorScheme(e.value)}></RadioButton>
                    <label htmlFor="theme1">Dark</label>
                </div>

            </Sidebar>
        </div>
    );
};

export default AppConfig;
