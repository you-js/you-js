import {} from "./utilities/vector.js";
import { Engine } from "./framework/engine.js";
import { Input } from "./framework/input.js";
import { Screen } from "./framework/screen.js";

let engine = null;

function start(configurations) {
	engine = new Engine();

	const screen = configurations.screen;
	const screenSize = screen?.size ?? [document.documentElement.clientWidth, document.documentElement.clientHeight];
	engine.screen = new Screen(screen.canvas, screenSize);

	engine.input = new Input(screen.canvas);

	const applications = configurations.applications;
	applications.forEach(app => engine.applications.push(app));

	engine.start();
}

function stop() {
	engine.stop();
	engine = null;
}

function getEngine() {
	return engine;
}

function getScreen() {
	return engine.screen;
}

function getContext() {
	return engine.screen.context;
}

function getInput() {
	return engine.input;
}

function push() {
	engine.screen.context.save();
}

function pop() {
	engine.screen.context.restore();
}

function clear() {
	engine.screen.context.clearRect(0, 0, ...engine.screen.size);
}

let mode = 'fill';

function fill() {
	mode = 'fill';
}

function stroke() {
	mode = 'stroke';
}

function color(color) {
	getContext()[mode + 'Style'] = color;
}

function rect(x, y, width, height) {
	getContext()[mode + 'Rect'](x, y, width, height);
}

function circle(x, y, radius) {
	const context = getContext();
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2);
	context[mode]();
}

function alpha(alpha) {
	getContext().globalAlpha = alpha;
}

function textHorizontal(align) {
	getContext().textAlign = align;
}

function textVertical(align) {
	getContext().textBaseline = align;
}

let _fontSize = '16px';
let _fontFamily = 'sans-serif';

function fontSize(size) {
	_fontSize = size;
	getContext().font = `${_fontSize} ${_fontFamily}`;
}

function fontFamily(family) {
	_fontFamily = family;
	getContext().font = `${_fontSize} ${_fontFamily}`;
}

function text(text, x, y) {
	getContext()[mode + 'Text'](text, x, y);
}

function rgb(r, g, b) {
	return `rgb(${r}, ${g}, ${b})`;
}

function rgba(r, g, b, a) {
	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function line(x1, y1, x2, y2) {
	const context = getContext();
	context.beginPath();
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
}

export default {
	start, stop,
	getEngine, getScreen, getContext, getInput,
	push, pop,
	clear,
	rgb, rgba,
	color, alpha,
	fill, stroke,
	line, rect, circle,
	text,
	textHorizontal, textVertical,
	fontSize, fontFamily,
}