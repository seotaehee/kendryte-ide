/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ContextKeyExpr, IContextKey, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { TPromise } from 'vs/base/common/winjs.base';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Direction, ITerminalCommandTracker, ITerminalConfiguration, ITerminalDimensions, ITerminalFont, } from 'vs/workbench/parts/terminal/common/terminal';
import { OpenOptions } from 'vs/workbench/parts/maix/serialPort/terminal/common/serial';

export { Direction, ITerminalCommandTracker, ITerminalConfiguration, ITerminalDimensions, ITerminalFont, } from 'vs/workbench/parts/terminal/common/terminal';

export const TERMINAL_PANEL_ID = 'workbench.panel.serialPort';

export const TERMINAL_SERVICE_ID = 'serialMonitorService';

/** A context key that is set when there is at least one opened integrated terminal. */
export const KEYBINDING_CONTEXT_TERMINAL_IS_OPEN = new RawContextKey<boolean>('serialPortIsOpen', false);
/** A context key that is set when the integrated terminal has focus. */
export const KEYBINDING_CONTEXT_TERMINAL_FOCUS = new RawContextKey<boolean>('serialPortFocus', undefined);
/** A context key that is set when the integrated terminal does not have focus. */
export const KEYBINDING_CONTEXT_TERMINAL_NOT_FOCUSED: ContextKeyExpr = KEYBINDING_CONTEXT_TERMINAL_FOCUS.toNegated();

/** A keybinding context key that is set when the integrated terminal has text selected. */
export const KEYBINDING_CONTEXT_TERMINAL_TEXT_SELECTED = new RawContextKey<boolean>('serialPortTextSelected', undefined);
/** A keybinding context key that is set when the integrated terminal does not have text selected. */
export const KEYBINDING_CONTEXT_TERMINAL_TEXT_NOT_SELECTED: ContextKeyExpr = KEYBINDING_CONTEXT_TERMINAL_TEXT_SELECTED.toNegated();

/**  A context key that is set when the find widget in integrated terminal is visible. */
export const KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_VISIBLE = new RawContextKey<boolean>('serialPortFindWidgetVisible', undefined);
/**  A context key that is set when the find widget in integrated terminal is not visible. */
export const KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_NOT_VISIBLE: ContextKeyExpr = KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_VISIBLE.toNegated();
/**  A context key that is set when the find widget find input in integrated terminal is focused. */
export const KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_INPUT_FOCUSED = new RawContextKey<boolean>('serialPortFindWidgetInputFocused', false);
/**  A context key that is set when the find widget find input in integrated terminal is not focused. */
export const KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_INPUT_NOT_FOCUSED: ContextKeyExpr = KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_INPUT_FOCUSED.toNegated();

export const NEVER_SUGGEST_SELECT_WINDOWS_SHELL_STORAGE_KEY = 'terminal.integrated.neverSuggestSelectWindowsShell';
export const NEVER_MEASURE_RENDER_TIME_STORAGE_KEY = 'terminal.integrated.neverMeasureRenderTime';

// The creation of extension host terminals is delayed by this value (milliseconds). The purpose of
// this delay is to allow the terminal instance to initialize correctly and have its ID set before
// trying to create the corressponding object on the ext host.
export const EXT_HOST_CREATION_DELAY = 100;

export const ISerialMonitorService = createDecorator<ISerialMonitorService>(TERMINAL_SERVICE_ID);

export const TerminalCursorStyle = {
	BLOCK: 'block',
	LINE: 'line',
	UNDERLINE: 'underline',
};

export const TERMINAL_CONFIG_SECTION = 'terminal.integrated';

export const DEFAULT_LETTER_SPACING = 0;
export const MINIMUM_LETTER_SPACING = -5;
export const DEFAULT_LINE_HEIGHT = 1.0;

export type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

export interface ITerminalConfigHelper {
	config: ITerminalConfiguration;

	getFont(): ITerminalFont;
}

export interface ISerialLaunchConfig {
	waitOnExit?: boolean;
	name?: string;
	options?: OpenOptions;
	serialDevice?: string;
	initialText?: string;
}

export interface ISerialMonitorService {
	_serviceBrand: any;

	activeTabIndex: number;
	configHelper: ITerminalConfigHelper;
	onActiveTabChanged: Event<void>;
	onTabDisposed: Event<ISerialPortTab>;
	onInstanceCreated: Event<ISerialPortInstance>;
	onInstanceDisposed: Event<ISerialPortInstance>;
	onInstanceProcessIdReady: Event<ISerialPortInstance>;
	onInstanceDimensionsChanged: Event<ISerialPortInstance>;
	onInstanceRequestExtHostProcess: Event<ITerminalProcessExtHostRequest>;
	onInstancesChanged: Event<void>;
	onInstanceTitleChanged: Event<string>;
	onActiveInstanceChanged: Event<ISerialPortInstance>;
	terminalInstances: ISerialPortInstance[];
	terminalTabs: ISerialPortTab[];

	/**
	 * Creates a terminal.
	 * @param shell The shell launch configuration to use.
	 * @param wasNewTerminalAction Whether this was triggered by a new terminal action, if so a
	 * default shell selection dialog may display.
	 */
	createTerminal(shell?: ISerialLaunchConfig, wasNewTerminalAction?: boolean): ISerialPortInstance;

	/**
	 * Creates a terminal renderer.
	 * @param name The name of the terminal.
	 */
	createTerminalRenderer(name: string): ISerialPortInstance;

	/**
	 * Creates a raw terminal instance, this should not be used outside of the terminal part.
	 */
	createInstance(
		terminalFocusContextKey: IContextKey<boolean>,
		configHelper: ITerminalConfigHelper,
		container: HTMLElement,
		shellLaunchConfig: ISerialLaunchConfig,
		doCreateProcess: boolean,
	): ISerialPortInstance;

	getInstanceFromId(terminalId: number): ISerialPortInstance;

	getInstanceFromIndex(terminalIndex: number): ISerialPortInstance;

	getTabLabels(): string[];

	getActiveInstance(): ISerialPortInstance;

	setActiveInstance(terminalInstance: ISerialPortInstance): void;

	setActiveInstanceByIndex(terminalIndex: number): void;

	getActiveOrCreateInstance(wasNewTerminalAction: true): TPromise<ISerialPortInstance>;

	getActiveOrCreateInstance(): ISerialPortInstance;

	splitInstance(instance: ISerialPortInstance, shell?: ISerialLaunchConfig): void;

	getActiveTab(): ISerialPortTab;

	setActiveTabToNext(): void;

	setActiveTabToPrevious(): void;

	setActiveTabByIndex(tabIndex: number): void;

	showPanel(focus?: boolean): TPromise<void>;

	hidePanel(): void;

	focusFindWidget(): TPromise<void>;

	hideFindWidget(): void;

	setContainers(panelContainer: HTMLElement, terminalContainer: HTMLElement): void;

	selectDefaultWindowsShell(): TPromise<string>;

	requestExtHostProcess(proxy: ITerminalProcessExtHostProxy, shellLaunchConfig: ISerialLaunchConfig, cols: number, rows: number): void;
}

export interface ISerialPortTab {
	activeInstance: ISerialPortInstance;
	terminalInstances: ISerialPortInstance[];
	title: string;
	onDisposed: Event<ISerialPortTab>;
	onInstancesChanged: Event<void>;

	focusPreviousPane(): void;

	focusNextPane(): void;

	resizePane(direction: Direction): void;

	setActiveInstanceByIndex(index: number): void;

	attachToElement(element: HTMLElement): void;

	setVisible(visible: boolean): void;

	layout(width: number, height: number): void;

	addDisposable(disposable: IDisposable): void;

	split(terminalFocusContextKey: IContextKey<boolean>, configHelper: ITerminalConfigHelper, shellLaunchConfig: ISerialLaunchConfig): ISerialPortInstance;
}

export interface ISerialPortInstance {
	/**
	 * The ID of the terminal instance, this is an arbitrary number only used to identify the
	 * terminal instance.
	 */
	readonly id: number;

	readonly cols: number;
	readonly rows: number;

	/**
	 * The process ID of the shell process, this is undefined when there is no process associated
	 * with this terminal.
	 */
	processId: number | undefined;

	/**
	 * An event that fires when the terminal instance's title changes.
	 */
	onTitleChanged: Event<string>;

	/**
	 * An event that fires when the terminal instance is disposed.
	 */
	onDisposed: Event<ISerialPortInstance>;

	onFocused: Event<ISerialPortInstance>;

	onProcessIdReady: Event<ISerialPortInstance>;

	onRequestExtHostProcess: Event<ISerialPortInstance>;

	onDimensionsChanged: Event<void>;

	onFocus: Event<ISerialPortInstance>;

	/**
	 * Attach a listener to the raw data stream coming from the pty, including ANSI escape
	 * sequences.
	 */
	onData: Event<string>;

	/**
	 * Attach a listener to the "renderer" input event, this event fires for terminal renderers on
	 * keystrokes and when the Terminal.sendText extension API is used.
	 * @param listener The listener function.
	 */
	onRendererInput: Event<string>;

	/**
	 * Attach a listener to listen for new lines added to this terminal instance.
	 *
	 * @param listener The listener function which takes new line strings added to the terminal,
	 * excluding ANSI escape sequences. The line event will fire when an LF character is added to
	 * the terminal (ie. the line is not wrapped). Note that this means that the line data will
	 * not fire for the last line, until either the line is ended with a LF character of the process
	 * is exited. The lineData string will contain the fully wrapped line, not containing any LF/CR
	 * characters.
	 */
	onLineData: Event<string>;

	/**
	 * Attach a listener that fires when the terminal's pty process exits. The number in the event
	 * is the processes' exit code, an exit code of null means the process was killed as a result of
	 * the ISerialPortInstance being disposed.
	 */
	onExit: Event<number>;

	processReady: TPromise<void>;

	/**
	 * The title of the terminal. This is either title or the process currently running or an
	 * explicit name given to the terminal instance through the extension API.
	 *
	 * @readonly
	 */
	title: string;

	/**
	 * The focus state of the terminal before exiting.
	 *
	 * @readonly
	 */
	hadFocusOnExit: boolean;

	/**
	 * False when the title is set by an API or the user. We check this to make sure we
	 * do not override the title when the process title changes in the terminal.
	 */
	isTitleSetByProcess: boolean;

	/**
	 * The shell launch config used to launch the shell.
	 */
	readonly shellLaunchConfig: ISerialLaunchConfig;

	/**
	 * Whether to disable layout for the terminal. This is useful when the size of the terminal is
	 * being manipulating (eg. adding a split pane) and we want the terminal to ignore particular
	 * resize events.
	 */
	disableLayout: boolean;

	/**
	 * An object that tracks when commands are run and enables navigating and selecting between
	 * them.
	 */
	readonly commandTracker: ITerminalCommandTracker;

	/**
	 * Dispose the terminal instance, removing it from the panel/service and freeing up resources.
	 */
	dispose(): void;

	/**
	 * Registers a link matcher, allowing custom link patterns to be matched and handled.
	 * @param regex The regular expression the search for, specifically this searches the
	 * textContent of the rows. You will want to use \s to match a space ' ' character for example.
	 * @param handler The callback when the link is called.
	 * @param matchIndex The index of the link from the regex.match(html) call. This defaults to 0
	 * (for regular expressions without capture groups).
	 * @param validationCallback A callback which can be used to validate the link after it has been
	 * added to the DOM.
	 * @return The ID of the new matcher, this can be used to deregister.
	 */
	registerLinkMatcher(
		regex: RegExp,
		handler: (url: string) => void,
		matchIndex?: number,
		validationCallback?: (uri: string, callback: (isValid: boolean) => void) => void,
	): number;

	/**
	 * Deregisters a link matcher if it has been registered.
	 * @param matcherId The link matcher's ID (returned after register)
	 * @return Whether a link matcher was found and deregistered.
	 */
	deregisterLinkMatcher(matcherId: number): void;

	/**
	 * Check if anything is selected in terminal.
	 */
	hasSelection(): boolean;

	/**
	 * Copies the terminal selection to the clipboard.
	 */
	copySelection(): void;

	/**
	 * Current selection in the terminal.
	 */
	readonly selection: string | undefined;

	/**
	 * Clear current selection.
	 */
	clearSelection(): void;

	/**
	 * Select all text in the terminal.
	 */
	selectAll(): void;

	/**
	 * Find the next instance of the term
	 */
	findNext(term: string): boolean;

	/**
	 * Find the previous instance of the term
	 */
	findPrevious(term: string): boolean;

	/**
	 * Notifies the terminal that the find widget's focus state has been changed.
	 */
	notifyFindWidgetFocusChanged(isFocused: boolean): void;

	/**
	 * Focuses the terminal instance.
	 *
	 * @param force Force focus even if there is a selection.
	 */
	focus(force?: boolean): void;

	/**
	 * Focuses and pastes the contents of the clipboard into the terminal instance.
	 */
	paste(): void;

	/**
	 * Send text to the terminal instance. The text is written to the stdin of the underlying pty
	 * process (shell) of the terminal instance.
	 *
	 * @param text The text to send.
	 * @param addNewLine Whether to add a new line to the text being sent, this is normally
	 * required to run a command in the terminal. The character(s) added are \n or \r\n
	 * depending on the platform. This defaults to `true`.
	 */
	sendText(text: string, addNewLine: boolean): void;

	/**
	 * Write text directly to the terminal, skipping the process if it exists.
	 * @param text The text to write.
	 */
	write(text: string): void;

	/** Scroll the terminal buffer down 1 line. */
	scrollDownLine(): void;

	/** Scroll the terminal buffer down 1 page. */
	scrollDownPage(): void;

	/** Scroll the terminal buffer to the bottom. */
	scrollToBottom(): void;

	/** Scroll the terminal buffer up 1 line. */
	scrollUpLine(): void;

	/** Scroll the terminal buffer up 1 page. */
	scrollUpPage(): void;

	/** Scroll the terminal buffer to the top. */
	scrollToTop(): void;

	/**
	 * Clears the terminal buffer, leaving only the prompt line.
	 */
	clear(): void;

	/**
	 * Attaches the terminal instance to an element on the DOM, before this is called the terminal
	 * instance process may run in the background but cannot be displayed on the UI.
	 *
	 * @param container The element to attach the terminal instance to.
	 */
	attachToElement(container: HTMLElement): void;

	/**
	 * Updates the configuration of the terminal instance.
	 */
	updateConfig(): void;

	/**
	 * Updates the accessibility support state of the terminal instance.
	 * @param isEnabled Whether it's enabled.
	 */
	updateAccessibilitySupport(isEnabled: boolean): void;

	/**
	 * Configure the dimensions of the terminal instance.
	 *
	 * @param dimension The dimensions of the container.
	 */
	layout(dimension: { width: number, height: number }): void;

	/**
	 * Sets whether the terminal instance's element is visible in the DOM.
	 *
	 * @param visible Whether the element is visible.
	 */
	setVisible(visible: boolean): void;

	/**
	 * Immediately kills the terminal's current pty process and launches a new one to replace it.
	 *
	 * @param shell The new launch configuration.
	 */
	reuseTerminal(shell?: ISerialLaunchConfig): void;

	/**
	 * Sets the title of the terminal instance.
	 */
	setTitle(title: string, eventFromProcess: boolean): void;

	setDimensions(dimensions: ITerminalDimensions): void;

	addDisposable(disposable: IDisposable): void;

	toggleEscapeSequenceLogging(): void;
}

export interface ITerminalProcessManager extends IDisposable {
	readonly processState: ProcessState;
	readonly ptyProcessReady: TPromise<void>;
	readonly shellProcessId: number;
	readonly initialCwd: string;

	readonly onProcessReady: Event<void>;
	readonly onProcessData: Event<string>;
	readonly onProcessTitle: Event<string>;
	readonly onProcessExit: Event<number>;

	addDisposable(disposable: IDisposable);

	createProcess(shellLaunchConfig: ISerialLaunchConfig, cols: number, rows: number);

	write(data: string): void;

	setDimensions(cols: number, rows: number): void;
}

export enum ProcessState {
	// The process has not been initialized yet.
	UNINITIALIZED,
	// The process is currently launching, the process is marked as launching
	// for a short duration after being created and is helpful to indicate
	// whether the process died as a result of bad shell and args.
	LAUNCHING,
	// The process is running normally.
	RUNNING,
	// The process was killed during launch, likely as a result of bad shell and
	// args.
	KILLED_DURING_LAUNCH,
	// The process was killed by the user (the event originated from VS Code).
	KILLED_BY_USER,
	// The process was killed by itself, for example the shell crashed or `exit`
	// was run.
	KILLED_BY_PROCESS
}

export interface ITerminalProcessExtHostProxy extends IDisposable {
	readonly terminalId: number;

	emitData(data: string): void;

	emitTitle(title: string): void;

	emitPid(pid: number): void;

	emitExit(exitCode: number): void;

	onInput: Event<string>;
	onResize: Event<{ cols: number, rows: number }>;
	onShutdown: Event<void>;
}

export interface ITerminalProcessExtHostRequest {
	proxy: ITerminalProcessExtHostProxy;
	shellLaunchConfig: ISerialLaunchConfig;
	cols: number;
	rows: number;
}
