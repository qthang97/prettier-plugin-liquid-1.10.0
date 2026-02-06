// ==UserScript==
// @name         Sapo Intelligent All-in-One (JS + CSS + HTML)
// @namespace    http://tampermonkey.net/
// @version      2025-11-29-V8-Fix-Hinting
// @description  Ultimate IntelliSense for Sapo (Acorn JS, CSSTree, Fuse.js) - Liquid & BWT Compatible
// @author       You
// @match        https://*.mysapo.net/admin/themes/*
// @exclude      https://*.mysapo.net/admin/themes/editor/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mysapo.net
// @run-at       document-idle
// @grant        window.onurlchange
// @require      https://raw.githubusercontent.com/qthang97/prettier-plugin-liquid-1.10.0/refs/heads/main/Sapo%20intellient%20All-in-One/html-hint.min.js
// @require      https://raw.githubusercontent.com/qthang97/prettier-plugin-liquid-1.10.0/refs/heads/main/Sapo%20intellient%20All-in-One/javascript-hint.min.js
// @require      https://raw.githubusercontent.com/qthang97/prettier-plugin-liquid-1.10.0/refs/heads/main/Sapo%20intellient%20All-in-One/show-hint.min.js
// @require      https://raw.githubusercontent.com/qthang97/prettier-plugin-liquid-1.10.0/refs/heads/main/Sapo%20intellient%20All-in-One/xml-hint.min.js
// @require      https://raw.githubusercontent.com/qthang97/prettier-plugin-liquid-1.10.0/refs/heads/main/Sapo%20intellient%20All-in-One/css-hint.min.js
// @require      https://raw.githubusercontent.com/qthang97/prettier-plugin-liquid-1.10.0/refs/heads/main/Sapo%20intellient%20All-in-One/anyword-hint.min.js
// @require      https://raw.githubusercontent.com/qthang97/prettier-plugin-liquid-1.10.0/refs/heads/main/Sapo%20intellient%20All-in-One/acorn-8-11-3.min.js
// @require      https://raw.githubusercontent.com/qthang97/prettier-plugin-liquid-1.10.0/refs/heads/main/Sapo%20intellient%20All-in-One/walk-8-3-2.min.js
// @require      https://raw.githubusercontent.com/qthang97/prettier-plugin-liquid-1.10.0/refs/heads/main/Sapo%20intellient%20All-in-One/csstree-2-3-1.min.js
// @require      https://raw.githubusercontent.com/qthang97/prettier-plugin-liquid-1.10.0/refs/heads/main/Sapo%20intellient%20All-in-One/fuse-7-0-0.min.js
// ==/UserScript==

;(function () {
	'use strict'
	const pad = n => n.toString().padStart(2, '0')
	const printDebugLog = (...args) => {
		if (DEBUG === true) {
			var date = new Date()
			var str_date = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
			console.log(`${str_date} -`, ...args)
		}
	}

	const DEBUG = false

	function waitLoadElement(elemWait, funCallback) {
		let count = 0
		let timeInterval = setInterval(() => {
			let tmpElem = document.querySelector(elemWait)
			if (tmpElem) {
				if (count >= 5) {
					funCallback()
					clearInterval(timeInterval)
				}
				count++
			}
		}, 100)

		setTimeout(() => {
			clearInterval(timeInterval)
		}, 30000)
	}

	// --- KHO DỮ LIỆU ---
	const jsKeywords = [
		'abstract',
		'arguments',
		'await',
		'async',
		'boolean',
		'break',
		'byte',
		'case',
		'catch',
		'char',
		'class',
		'const',
		'continue',
		'debugger',
		'default',
		'delete',
		'do',
		'double',
		'else',
		'enum',
		'eval',
		'export',
		'extends',
		'false',
		'final',
		'finally',
		'float',
		'for',
		'function',
		'goto',
		'if',
		'implements',
		'import',
		'in',
		'instanceof',
		'int',
		'interface',
		'let',
		'long',
		'native',
		'new',
		'null',
		'package',
		'private',
		'protected',
		'public',
		'return',
		'short',
		'static',
		'super',
		'switch',
		'synchronized',
		'this',
		'throw',
		'throws',
		'transient',
		'true',
		'try',
		'typeof',
		'var',
		'void',
		'volatile',
		'while',
		'with',
		'yield',
		'Promise',
		'Map',
		'Set',
		'WeakMap',
		'WeakSet',
		'Symbol',
		'Proxy',
		'Reflect',
		'JSON',
		'Math',
		'Date',
		'Array',
		'Object',
		'String',
		'Number',
		'Boolean',
		'RegExp',
		'Error',
		'undefined',
		'NaN',
		'Infinity',
		'map',
		'filter',
		'reduce',
		'forEach',
		'find',
		'findIndex',
		'includes',
		'indexOf',
		'push',
		'pop',
		'shift',
		'unshift',
		'splice',
		'slice',
		'join',
		'split',
		'keys',
		'values',
		'entries',
		'assign',
		'freeze',
		'seal',
		'create',
		'length',
		'toString',
		'substring',
		'substr',
		'replace',
		'replaceAll',
		'trim',
		'window',
		'document',
		'console',
		'log',
		'error',
		'warn',
		'info',
		'localStorage',
		'sessionStorage',
		'navigator',
		'history',
		'location',
		'setTimeout',
		'setInterval',
		'clearTimeout',
		'clearInterval',
		'alert',
		'prompt',
		'confirm',
		'fetch',
		'querySelector',
		'querySelectorAll',
		'getElementById',
		'getElementsByClassName',
		'addEventListener',
		'removeEventListener',
		'innerHTML',
		'innerText',
		'textContent',
		'getAttribute',
		'setAttribute',
		'classList',
		'add',
		'remove',
		'toggle',
		'body',
		'head',
		'createElement',
		'appendChild',
		'style',
		'src',
		'href',
		'$',
		'jQuery',
		'sapo',
		'Bizweb',
	]

	let localJsVars = new Set()
	let localObjectKeys = {}

	let currentFileType = 'unknown'
	const LS_KEY = window.location.host

	// --- 1. DETECT URL & FILE TYPE ---
	if (window.onurlchange === null) {
		window.addEventListener('urlchange', info => {
			currentFileType = detectFileType(info.url)
			// Khi đổi file thì mới clear, còn đang gõ thì không clear ẩu
			localJsVars.clear()
			localObjectKeys = {}
			localCssClasses.clear()
		})
	}

	function detectFileType(urlString) {
		const url = new URL(urlString)
		const key = url.searchParams.get('key')
		if (!key) return 'unknown'
		if (key.endsWith('.js') || key.endsWith('.js.bwt')) return 'javascript'
		if (key.endsWith('.css') || key.endsWith('.scss') || key.endsWith('.css.bwt') || key.endsWith('.scss.bwt')) return 'css'
		if (key.endsWith('.bwt') || key.endsWith('.liquid') || key.endsWith('.html')) return 'html'
		return 'unknown'
	}

	/* ========================== CSS Inteligent ==============================*/
	let localCssClasses = new Set()
	let externalCssClasses = new Set()
	let cssParentChildMap = {}
	let externalScssVariables = new Set() // Biến từ file bên ngoài
	let localScssVariables = new Set() // Biến trong file đang mở
	// --- 2. DATA LOADERS (CSS External) ---
	function getCsrfToken() {
		const meta = document.querySelector('meta[name="csrf-token"]')
		return meta ? meta.getAttribute('content') : ''
	}
	// Scan and parse with css tree
	function parseSCSSWithStack(cssText, targetSet, targetMap, targetVarSet = null) {
		// [NEW] 1a. Quét biến SCSS trước khi clean (để tránh mất dữ liệu trong ngoặc hoặc logic)
		// Regex tìm chuỗi bắt đầu bằng $ theo sau là chữ/số/- và kết thúc bằng dấu :
		if (targetVarSet) {
			const varRegex = /\$([a-zA-Z0-9_-]+)\s*:/g
			let varMatch
			while ((varMatch = varRegex.exec(cssText)) !== null) {
				targetVarSet.add('$' + varMatch[1]) // Lưu tên biến (vd: $primary-color)
			}
		}

		// 1. Dọn dẹp sơ bộ (Giữ nguyên logic cũ của bạn)
		let clean = cssText
			.replace(/\/\*[\s\S]*?\*\//g, '')
			.replace(/\/\/.*$/gm, '')
			.replace(/\{%[\s\S]*?%\}/g, ' ')
			.replace(/\{\{[\s\S]*?\}\}/g, ' ')
			.replace(/\([^\)]*\)/g, '()')

		let stack = []
		let buffer = ''

		// Regex trích xuất class name (Giữ nguyên)
		const extractClassNames = str => {
			const pureStr = str.split(':')[0]
			const matches = pureStr.match(/\.(-?[_a-zA-Z0-9-]+)/g)
			return matches ? matches.map(c => c.substring(1)) : []
		}

		// ... (Phần vòng lặp for parse class giữ nguyên không đổi) ...
		for (let i = 0; i < clean.length; i++) {
			const char = clean[i]
			if (char === '{') {
				const selectorStr = buffer.trim()
				if (selectorStr.startsWith('@')) {
					stack.push(null)
				} else {
					const classesInSelector = extractClassNames(selectorStr)
					if (classesInSelector.length > 0) {
						const currentClass = classesInSelector[classesInSelector.length - 1]
						targetSet.add(currentClass)
						if (stack.length > 0) {
							let parent = null
							for (let k = stack.length - 1; k >= 0; k--) {
								if (stack[k]) {
									parent = stack[k]
									break
								}
							}
							if (parent) {
								if (!targetMap[parent]) targetMap[parent] = new Set()
								targetMap[parent].add(currentClass)
							}
						}
						stack.push(currentClass)
					} else {
						stack.push(null)
					}
				}
				buffer = ''
			} else if (char === '}') {
				stack.pop()
				buffer = ''
			} else if (char === ';') {
				buffer = ''
			} else {
				buffer += char
			}
		}
	}

	// Get Css file from current Asset
	async function fetchExternalCSS(forceUpdate = false, retryCount = 0) {
		console.log(`[All-in-One] Bắt đầu lấy CSS... (Lần thử: ${retryCount})`)
		const MAX_RETRIES = 2
		let EXTERNAL_CSS_URL = []

		let sideBar_el = document.querySelector('#asset-list-container')
		if (sideBar_el) {
			let a_tags = sideBar_el.querySelectorAll('li a')
			if (a_tags.length > 0) {
				EXTERNAL_CSS_URL = Array.from(a_tags)
					.map(r => r.getAttribute('data-asset-key'))
					.filter(r => /\.(css|css\.bwt|scss\.bwt|scss)$/i.test(r))
			}
		}

		if (EXTERNAL_CSS_URL.length === 0) return

		try {
			let adminUrl = window.location.href
			let matchUrlWithAdmin = adminUrl.match(/(https:\/\/\w.+\/admin\/themes\/)(\d+)/i)
			if (!matchUrlWithAdmin) throw 'Lỗi URL Admin'

			if (forceUpdate) {
				externalCssClasses.clear()
				externalScssVariables.clear() // [NEW] Xóa biến cũ
				cssParentChildMap = {}
			}

			const btn = document.getElementById('btn-refresh-css')
			if (btn) btn.innerText = retryCount > 0 ? `Thử lại (${retryCount})...` : 'Đang tải...'

			for (let i = 0; i < EXTERNAL_CSS_URL.length; i++) {
				let assetKey = EXTERNAL_CSS_URL[i]
				let url = matchUrlWithAdmin[1] + 'assets/' + matchUrlWithAdmin[2] + '?key=' + encodeURIComponent(assetKey)

				const response = await fetch(url, {
					headers: {
						'content-type': 'application/json; charset=utf-8',
						Accept: 'application/json',
						'X-Requested-With': 'XMLHttpRequest',
						'X-CSRF-Token': getCsrfToken(),
					},
				})

				if (!response.ok) throw new Error('HTTP Error')

				const rawText = await response.text()
				let cssContent = ''
				try {
					const data = JSON.parse(rawText)
					cssContent = data.content || data.value || (data.asset ? data.asset.value : '')
				} catch (e) {
					cssContent = rawText
				}

				if (cssContent && typeof cssContent === 'string') {
					// QUAN TRỌNG: Truyền biến toàn cục vào đây
					parseSCSSWithStack(cssContent, externalCssClasses, cssParentChildMap, externalScssVariables)
				}
			}

			// Serialize Map for storage
			const serializedMap = {}
			for (const [key, valSet] of Object.entries(cssParentChildMap)) {
				serializedMap[key] = Array.from(valSet)
			}
			const dataToSave = { flat: [...externalCssClasses], relations: serializedMap }
			localStorage.setItem(LS_KEY, JSON.stringify(dataToSave))

			console.log(`[All-in-One] Xong. ${externalCssClasses.size} classes.`)
			const cachingStatus = document.getElementById('csscaching')
			if (cachingStatus) {
				cachingStatus.innerText = `Đã cache ${externalCssClasses.size} class.`
				setTimeout(() => cachingStatus.remove(), 3000)
			}
		} catch (e) {
			console.error('Lỗi Fetch CSS:', e)
			if (retryCount < MAX_RETRIES) {
				setTimeout(() => fetchExternalCSS(forceUpdate, retryCount + 1), 2000)
				return
			}
		} finally {
			if (retryCount >= MAX_RETRIES || !document.getElementById('btn-refresh-css')?.innerText.includes('Thử lại')) {
				const btn = document.getElementById('btn-refresh-css')
				if (btn) btn.innerText = 'Cập nhật CSS Cache'
			}
		}
	}

	// Scan and detect context inside tag style or file type .css, .scss
	function isCssContext(editor) {
		if (currentFileType === 'css' || currentFileType === 'scss') return true
		const cursor = editor.getCursor()
		const token = editor.getTokenAt(cursor)
		const inner = CodeMirror.innerMode(editor.getMode(), token.state)
		if (inner.mode.name === 'css' || inner.mode.name === 'text/x-scss') return true
		let state = token.state
		while (state) {
			if (state.tagName === 'style') return true
			if (state.context && state.context.tagName === 'style') return true
			if (state.htmlState) state = state.htmlState
			else if (state.localState) state = state.localState
			else break
		}
		return false
	}

	// Helper: Tìm class cha
	function findParentTagClass(cm) {
		const cursor = cm.getCursor()
		const doc = cm.getDoc()

		// Quét ngược tối đa 30 dòng để tìm thẻ cha
		for (let i = cursor.line; i >= Math.max(0, cursor.line - 30); i--) {
			let text = doc.getLine(i)

			// Nếu là dòng hiện tại, chỉ xét phần văn bản TRƯỚC con trỏ để tránh bắt chính thẻ đang gõ
			if (i === cursor.line) {
				// Kiểm tra xem con trỏ có đang nằm trong thẻ mở không (<div ... | ... >)
				const textBeforeCursor = text.slice(0, cursor.ch)
				const lastOpenTag = textBeforeCursor.lastIndexOf('<')
				const lastCloseTag = textBeforeCursor.lastIndexOf('>')

				// Nếu tìm thấy dấu < mà chưa thấy dấu >, tức là đang ở trong thẻ hiện tại
				// -> Ta bỏ qua dòng này để tìm CHA của nó
				if (lastOpenTag > lastCloseTag) {
					continue
				}
			}

			// Regex tìm thẻ mở có class (chấp nhận cả xuống dòng attribute)
			// Cấu trúc: <tên_thẻ ... class="giá trị" ... >
			// Lưu ý: Đơn giản hóa để bắt các trường hợp phổ biến
			const classMatch = text.match(/class\s*=\s*["']([^"']+)["']/)

			if (classMatch) {
				// Kiểm tra xem dòng này có phải là thẻ đóng không (</div>) -> Bỏ qua
				if (text.match(/<\//)) continue

				// Kiểm tra xem có phải thẻ tự đóng không (<img ... />) -> Bỏ qua
				if (text.match(/\/>/)) continue

				// Nếu thỏa mãn, đây chính là thẻ cha gần nhất có class
				return classMatch[1].split(/\s+/).filter(c => c.trim().length > 0)
			}
		}
		return []
	}

	function getClassHints(editor) {
		const cursor = editor.getCursor()
		// Lấy dòng hiện tại và tìm từ đang gõ
		const token = editor.getTokenAt(cursor)

		// Xác định chính xác từ đang gõ (handle trường hợp con trỏ nằm giữa từ hoặc sau dấu cách)
		const line = editor.getLine(cursor.line)
		const beforeCursor = line.slice(0, cursor.ch)

		// Kiểm tra xem có đang trong attribute class="..." không
		if (!/class\s*=\s*["'][^"']*$/.test(beforeCursor) && token.type !== 'string') {
			// Fallback lỏng lẻo hơn cho trường hợp token chưa được tokenize là string
			if (!beforeCursor.includes('class=')) return null
		}

		// Lấy từ khóa đang gõ dở (wordToComplete)
		let wordToComplete = ''
		let startPos = cursor.ch

		const matchWord = beforeCursor.match(/([a-zA-Z0-9_\-]+)$/)
		if (matchWord) {
			wordToComplete = matchWord[1]
			startPos = cursor.ch - wordToComplete.length
		}

		// 1. TÌM CLASS CHA & CLASS CON LIÊN QUAN
		const parentClasses = findParentTagClass(editor)
		let childClasses = new Set()

		// Duyệt qua các class của cha, tìm con của nó trong map
		parentClasses.forEach(pClass => {
			if (cssParentChildMap[pClass]) {
				cssParentChildMap[pClass].forEach(child => childClasses.add(child))
			}
		})

		const all = [...externalCssClasses, ...localCssClasses]
		let priorityList = [] // List ưu tiên (con của cha)
		let normalList = [] // List thường

		const searchLower = wordToComplete.toLowerCase()

		all.forEach(cls => {
			const clsLower = cls.toLowerCase()
			const isChild = childClasses.has(cls)

			// Logic lọc thông minh hơn:
			if (isChild) {
				// Nếu là class con (quan hệ cha-con đúng):
				// Chỉ cần CHỨA từ khóa là hiển thị (ví dụ gõ "coupon" vẫn ra "box-title" nếu box-title nằm trong section_coupon? Không, gõ "title" ra "box-title")
				// Hoặc nếu chưa gõ gì (searchLower == '') thì hiện hết con
				if (searchLower === '' || clsLower.includes(searchLower)) {
					priorityList.push(cls)
				}
			} else {
				// Nếu là class thường: Phải bắt đầu bằng từ khóa hoặc chứa (nếu từ khóa dài)
				if (clsLower.startsWith(searchLower)) {
					normalList.push(cls)
				} else if (searchLower.length > 2 && clsLower.includes(searchLower)) {
					normalList.push(cls)
				}
			}
		})

		// Sắp xếp: Ưu tiên list con lên đầu
		priorityList.sort((a, b) => a.length - b.length)
		normalList.sort((a, b) => a.length - b.length)

		// Gộp lại: Ưu tiên trước -> Thường sau
		let resultList = [...new Set([...priorityList, ...normalList])]
		if (resultList.length > 50) resultList.length = 50 // Giới hạn số lượng

		const processedList = resultList.map(cls => {
			const isPriority = childClasses.has(cls)
			return {
				text: cls,
				// Thêm dấu ★ để nhận biết class này được gợi ý dựa trên ngữ cảnh cha
				displayText: isPriority ? `★ ${cls}` : cls,
				className: isPriority ? 'CodeMirror-hint-priority' : '',
			}
		})

		return {
			list: processedList,
			from: CodeMirror.Pos(cursor.line, startPos),
			to: CodeMirror.Pos(cursor.line, cursor.ch),
		}
	}

	// Hàm mới: Gợi ý hỗn hợp cho CSS/SCSS
	function getCssScssHints(editor, options) {
		const cursor = editor.getCursor()
		const token = editor.getTokenAt(cursor)
		const line = editor.getLine(cursor.line)
		const startChar = line.charAt(token.start)

		// Xử lý từ khóa đang gõ
		let word = token.string
		let start = token.start

		// --- [NEW] CASE 1: SCSS Variables ($) ---
		// Kiểm tra nếu token bắt đầu bằng $ HOẶC ký tự trước đó là $
		if (word.startsWith('$') || startChar === '$' || token.type === 'variable-2') {
			if (!word.startsWith('$') && startChar === '$') {
				// Trường hợp vừa gõ $ chưa có chữ (token có thể rỗng hoặc sai lệch)
				word = '$' + word
				start = token.start
			} else if (word === '$') {
				// Mới chỉ gõ dấu $
			}

			// Lấy danh sách biến
			const allVars = [...externalScssVariables, ...localScssVariables]
			const matched = allVars.filter(v => v.startsWith(word))

			return {
				list: matched.map(v => ({
					text: v,
					displayText: v,
					className: 'CodeMirror-hint-scss-var', // CSS class để style màu sắc nếu muốn
				})),
				from: CodeMirror.Pos(cursor.line, start),
				to: CodeMirror.Pos(cursor.line, cursor.ch),
			}
		}

		// --- [NEW] CASE 2: SCSS Directives (@) ---
		if (word.startsWith('@') || startChar === '@' || token.type === 'def') {
			let search = word.startsWith('@') ? word : '@' + word
			// Lọc trong danh sách built-in bắt đầu bằng @
			const matched = scssBuiltIns.filter(item => item.startsWith('@') && item.startsWith(search))

			if (matched.length > 0) {
				return {
					list: matched,
					from: CodeMirror.Pos(cursor.line, start),
					to: CodeMirror.Pos(cursor.line, cursor.ch),
				}
			}
		}

		// --- CASE 3: CSS Class Selectors (.) ---
		// (Logic cũ của bạn, giữ nguyên)
		const isClassSelector = word.startsWith('.') || (token.type === 'error' && /^[\w-]+$/.test(word) && line.charAt(start - 1) === '.') || (word.trim() === '' && line.charAt(cursor.ch - 1) === '.')

		if (isClassSelector) {
			let cleanWord = word
			let cleanStart = start

			if (cleanWord.startsWith('.')) {
				cleanWord = cleanWord.slice(1)
				cleanStart++
			} else if (line.charAt(start - 1) === '.') {
				cleanStart = start
			} else if (cleanWord.trim() === '') {
				cleanStart = cursor.ch
			}

			const all = [...externalCssClasses, ...localCssClasses]
			const matched = all
				.filter(c => c.toLowerCase().startsWith(cleanWord.toLowerCase()))
				.sort((a, b) => a.length - b.length)
				.slice(0, 50)

			if (matched.length > 0) {
				return {
					list: matched.map(c => ({
						text: c,
						displayText: `.${c}`,
						className: 'CodeMirror-hint-css-selector',
					})),
					from: CodeMirror.Pos(cursor.line, cleanStart),
					to: CodeMirror.Pos(cursor.line, cursor.ch),
				}
			}
		}

		// --- [NEW] CASE 4: SCSS Functions & Native Values ---
		// Nếu không phải là class, không phải biến, ta gợi ý hàm SCSS
		// kết hợp với gợi ý native của CodeMirror (thuộc tính CSS)

		// Gọi native hint trước
		const nativeHintFunc = CodeMirror.hint.css || CodeMirror.hint.anyword
		let nativeResult = nativeHintFunc(editor, options) || { list: [], from: CodeMirror.Pos(cursor.line, start), to: CodeMirror.Pos(cursor.line, cursor.ch) }

		// Lọc các hàm SCSS (không bắt đầu bằng @)
		const matchedScssFuncs = scssBuiltIns.filter(item => !item.startsWith('@') && item.startsWith(word))

		if (matchedScssFuncs.length > 0) {
			// Gộp kết quả: Hàm SCSS lên đầu, sau đó đến native hints
			const scssHints = matchedScssFuncs.map(f => ({
				text: f + '()', // Thêm dấu ngoặc cho hàm
				displayText: f,
				className: 'CodeMirror-hint-scss-func',
			}))

			// Merge vào list native (nếu nativeResult.list là mảng string thì phải convert, nếu là object thì giữ nguyên)
			// CodeMirror hint list có thể là array string hoặc array object.
			let mergedList = [...scssHints]

			// Append native items
			if (nativeResult.list) {
				mergedList = mergedList.concat(nativeResult.list)
			}

			nativeResult.list = mergedList
		}

		return nativeResult
	}

	// Scan CSS on current file open
	function scanLocalCSS(editor) {
		const content = editor.getValue()
		localCssClasses.clear() // Xóa dữ liệu cũ của file hiện tại
		localScssVariables.clear() // [NEW] Reset biến local

		// [NEW] Truyền localScssVariables vào tham số thứ 4
		parseSCSSWithStack(content, localCssClasses, cssParentChildMap, localScssVariables)

		return localCssClasses
	}

	// Save CSS cache to localStorage
	function updateLocalCachedDataWhenSaveFile(scannedLocalClasses) {
		if (!scannedLocalClasses || scannedLocalClasses.size === 0) return

		const cachedData = localStorage.getItem(LS_KEY)
		if (cachedData) {
			try {
				const parsedData = JSON.parse(cachedData)
				if (parsedData.flat && Array.isArray(parsedData.flat)) {
					const tmpSet = new Set(parsedData.flat)
					// Merge class mới quét được vào
					scannedLocalClasses.forEach(cls => tmpSet.add(cls))
					parsedData.flat = Array.from(tmpSet)

					// Cập nhật luôn cả Map quan hệ (vì scanLocalCSS đã update vào cssParentChildMap rồi)
					const serializedMap = {}
					for (const [key, valSet] of Object.entries(cssParentChildMap)) {
						serializedMap[key] = Array.from(valSet)
					}
					parsedData.relations = serializedMap

					localStorage.setItem(LS_KEY, JSON.stringify(parsedData))

					// Cập nhật biến runtime toàn cục để gợi ý ngay lập tức
					scannedLocalClasses.forEach(cls => externalCssClasses.add(cls))

					console.log(`[All-in-One] Đã cập nhật ${scannedLocalClasses.size} class mới vào Cache.`)
				}
			} catch (e) {
				console.error('[All-in-One] Lỗi khi cập nhật cache cục bộ:', e)
			}
		}
	}

	// Handel Ctrl + S then save css cache to local storage
	function handleCtrlS(editor) {
		let tmpClass = scanLocalCSS(editor)
		updateLocalCachedDataWhenSaveFile(tmpClass)
		console.log('[All-in-One] Bắt Ctrl+S: Đã cập nhật local cache.')
		const message = `[IntelliSense] Đã quét xong (${localCssClasses.size} classes) và cập nhật cache!`
		console.warn(message)
	}

	// Create Button refresh cache manual
	function createUpdateButton() {
		if (document.getElementById('btn-refresh-css')) return
		let btn
		const divEl = document.querySelector('.template-editor-titlebar__actions')
		if (!divEl) {
			btn = document.createElement('button')
			btn.id = 'btn-refresh-css'
			btn.innerText = 'Cập nhật CSS Cache'
			Object.assign(btn.style, {
				position: 'fixed',
				bottom: '20px',
				right: '20px',
				zIndex: 9999,
				padding: '10px 15px',
				backgroundColor: '#008060',
				color: '#fff',
				border: 'none',
				borderRadius: '4px',
				cursor: 'pointer',
				boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
				fontWeight: 'bold',
				fontSize: '14px',
			})
			document.body.appendChild(btn)
		} else {
			divEl.insertAdjacentHTML('afterbegin', '<span class="ui-button ui-button--transparent ui-button--size-small" href="javascript:void(0);" id="btn-refresh-css">Cập nhật CSS Cache</span>')
		}
		btn = divEl.querySelector('#btn-refresh-css')
		btn.addEventListener('click', function (e) {
			e.preventDefault()
			fetchExternalCSS(true)
		})
	}

	// Init CSS
	function initCSSManager() {
		const cachedData = localStorage.getItem(LS_KEY)
		if (cachedData) {
			try {
				const parsed = JSON.parse(cachedData)

				// Kiểm tra xem cache là format CŨ (Mảng) hay MỚI (Object)
				if (Array.isArray(parsed)) {
					// Format cũ -> Fetch lại để có data mới xịn hơn
					console.log('Phát hiện cache cũ, đang fetch lại...')
					fetchExternalCSS(true)
					return
				}

				// Load Format mới
				if (parsed.flat) {
					parsed.flat.forEach(c => externalCssClasses.add(c))
				}
				if (parsed.relations) {
					for (const key in parsed.relations) {
						cssParentChildMap[key] = new Set(parsed.relations[key])
					}
				}
				console.log(`[All-in-One] Loaded relations map.`)
				document.getElementById('csscaching')?.remove()
			} catch (e) {
				fetchExternalCSS(true)
			}
		} else {
			fetchExternalCSS(true)
		}
		createUpdateButton()
	}

	/* ========================= JS Intelligent ========================= */

	// Scan JS on current
	function scanLocalJS(editor) {
		const content = editor.getValue()
		const newVars = new Set()
		const newObjKeys = {}
		let hasSuccessfulParse = false // Cờ đánh dấu parse thành công

		const stripLiquidJs = code => {
			let clean = code.replace(/\{\{[\s\S]*?\}\}/g, '0')
			clean = clean.replace(/\{%[\s\S]*?%\}/g, ' ')
			return clean
		}

		const parseCodeWithAcorn = jsText => {
			try {
				const cleanJs = stripLiquidJs(jsText)
				// allowReturnOutsideFunction: Giúp parse được cả trong script tag rời rạc
				const ast = acorn.parse(cleanJs, {
					ecmaVersion: 2020,
					sourceType: 'script',
					allowReturnOutsideFunction: true,
					locations: true,
				})

				acorn.walk.simple(ast, {
					VariableDeclarator(node) {
						if (node.id.type === 'Identifier') {
							newVars.add(node.id.name)
							if (node.init && node.init.type === 'ObjectExpression') {
								const keys = []
								node.init.properties.forEach(prop => {
									if (prop.key) {
										keys.push(prop.key.name || prop.key.value)
									}
								})
								if (keys.length > 0) {
									newObjKeys[node.id.name] = keys
								}
							}
						}
					},
					FunctionDeclaration(node) {
						if (node.id && node.id.name) {
							newVars.add(node.id.name)
						}
					},
					Function(node) {
						node.params.forEach(param => {
							if (param.type === 'Identifier') {
								newVars.add(param.name)
							}
						})
					},
				})
				hasSuccessfulParse = true // Parse ngon lành mới bật cờ
			} catch (e) {
				// Lỗi thì thôi, giữ cờ false
			}
		}

		if (currentFileType === 'javascript') {
			parseCodeWithAcorn(content)
		} else {
			const scriptBlockRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi
			let blockMatch
			while ((blockMatch = scriptBlockRegex.exec(content)) !== null) {
				parseCodeWithAcorn(blockMatch[1])
			}
		}

		// SỬA LỖI QUAN TRỌNG: Chỉ cập nhật biến toàn cục nếu parse thành công
		// Nếu parse thất bại (do đang gõ dở), giữ nguyên danh sách biến cũ để gợi ý
		if (hasSuccessfulParse && newVars.size > 0) {
			localJsVars = newVars
			localObjectKeys = newObjKeys
		}
	}

	// Scan and detect context inside tag script or file type .js
	function isJsContext(cm) {
		if (currentFileType === 'javascript') return true
		const cursor = cm.getCursor()
		const doc = cm.getDoc()
		const totalLines = doc.lineCount()
		const regexOpen = /<\s*script\b/gi
		const regexClose = /<\s*\/\s*script\b/gi

		const getRegexLastIndex = (str, regex) => {
			regex.lastIndex = 0
			let match
			let lastIndex = -1
			while ((match = regex.exec(str)) !== null) {
				lastIndex = match.index
			}
			return lastIndex
		}

		// printDebugLog(`Checking JS Context at Line ${cursor.line + 1}, Ch ${cursor.ch}`)
		let foundOpenTag = false
		for (let i = cursor.line; i >= 0; i--) {
			let text = doc.getLine(i)
			if (i === cursor.line) text = text.slice(0, cursor.ch)

			const lastOpen = getRegexLastIndex(text, regexOpen)
			const lastClose = getRegexLastIndex(text, regexClose)

			if (lastClose !== -1) {
				if (lastClose > lastOpen) {
					// printDebugLog(`-> FAIL: Found </script> at line ${i + 1} pos ${lastClose}. It is after <script pos ${lastOpen}`)
					return false
				}
			}
			if (lastOpen !== -1) {
				// printDebugLog(`-> FOUND START: <script at line ${i + 1} pos ${lastOpen}`)
				foundOpenTag = true
				break
			}
		}

		if (!foundOpenTag) {
			// printDebugLog(`-> FAIL: Scanned all way up, no <script found.`)
			return false
		}

		for (let i = cursor.line; i < totalLines; i++) {
			let text = doc.getLine(i)
			if (i === cursor.line) text = text.slice(cursor.ch)
			regexOpen.lastIndex = 0
			regexClose.lastIndex = 0
			const matchOpen = regexOpen.exec(text)
			const matchClose = regexClose.exec(text)
			const firstOpen = matchOpen ? matchOpen.index : -1
			const firstClose = matchClose ? matchClose.index : -1

			if (firstOpen !== -1) {
				if (firstClose === -1 || firstOpen < firstClose) {
					// printDebugLog(`-> FAIL: Found new <script at line ${i + 1} pos ${firstOpen} BEFORE </script>`)
					return false
				}
			}
			if (firstClose !== -1) {
				// printDebugLog(`=> JS CONTEXT CONFIRMED! (Found <script up, </script> down)`)
				return true
			}
		}
		// printDebugLog(`-> FAIL: End of file, no </script> found.`)
		return false
	}

	// --- 5. HINT PROVIDERS (FIXED: ƯU TIÊN PREFIX) ---
	function getJsHints(cm) {
		const cursor = cm.getCursor()
		const token = cm.getTokenAt(cursor)
		const line = cm.getLine(cursor.line)

		// A. Object Keys
		let isDotContext = false
		let objectName = ''
		if (token.string === '.') {
			isDotContext = true
			let prevToken = cm.getTokenAt({ line: cursor.line, ch: token.start })
			objectName = prevToken.string.trim()
		} else if (line.charAt(token.start - 1) === '.') {
			isDotContext = true
			let prevToken = cm.getTokenAt({ line: cursor.line, ch: token.start - 1 })
			objectName = prevToken.string.trim()
		}

		if (isDotContext) {
			if (localObjectKeys[objectName]) {
				return {
					list: localObjectKeys[objectName],
					from: CodeMirror.Pos(cursor.line, token.string === '.' ? cursor.ch : token.start),
					to: CodeMirror.Pos(cursor.line, cursor.ch),
				}
			}
		}

		// B. Biến thường (FIXED Logic)
		const startOfWord = line.slice(0, cursor.ch).search(/[a-zA-Z0-9_$]+$/)
		let currentWord = startOfWord !== -1 ? line.slice(startOfWord, cursor.ch) : ''
		if (!currentWord) return null
		if (line.charAt(startOfWord - 1) === '.') return null

		const combined = [...jsKeywords, ...localJsVars]

		// ƯU TIÊN 1: Tìm kiếm chính xác (Starts With) trước
		// Logic: Nếu gõ '$in', ta muốn thấy '$inputSelector' ngay đầu tiên
		let exactMatches = combined.filter(item => item.toLowerCase().startsWith(currentWord.toLowerCase()))
		exactMatches.sort((a, b) => a.length - b.length || a.localeCompare(b))

		// ƯU TIÊN 2: Nếu không có kết quả chính xác, mới dùng Fuse.js (Fuzzy)
		// Hoặc gộp chung nhưng ưu tiên exact matches lên đầu
		let fuzzyMatches = []
		if (exactMatches.length < 5) {
			// Nếu ít kết quả chính xác quá thì tìm thêm fuzzy
			const fuse = new Fuse(combined, {
				threshold: 0.2, // Giảm độ nhạy xuống để bớt rác (0.4 -> 0.2)
				ignoreLocation: true, // Tìm ở mọi vị trí
			})
			const searchResults = fuse.search(currentWord)
			fuzzyMatches = searchResults.map(res => res.item)

			// Loại bỏ trùng lặp đã có trong exactMatches
			fuzzyMatches = fuzzyMatches.filter(item => !exactMatches.includes(item))
		}

		let resultList = [...exactMatches, ...fuzzyMatches]

		return {
			list: resultList,
			from: CodeMirror.Pos(cursor.line, startOfWord !== -1 ? startOfWord : cursor.ch),
			to: CodeMirror.Pos(cursor.line, cursor.ch),
		}
	}

	/* ================================= Main ================================ */
	function applyConfigToCodeMirror(cm) {
		if (cm._hasAllInOneHook) return

		console.log('[All-in-One] Strict JS/CSS Context Applied!')
		document.body.insertAdjacentHTML('beforeend', `<div style="position: fixed;bottom: 0;z-index: 999;background: #08f;right: 4px;color: #fff;padding: 2px 10px;" id="csscaching"></div>`)
		const cachingStatus = document.getElementById('csscaching')
		if (cachingStatus) cachingStatus.innerText = 'Chờ css caching...'
		cm._wasInJsBlock = false
		cm._wasInCssBlock = false

		const extraKeys = cm.getOption('extraKeys') || {}
		let debounceScanTimer = null

		const performFullScan = editor => {
			if (currentFileType === 'javascript' || isJsContext(editor)) {
				scanLocalJS(editor)
			}
			scanLocalCSS(editor)
		}

		const triggerIntelliSense = (editor, isAuto = false) => {
			if (!isAuto) performFullScan(editor)

			const cursor = editor.getCursor()
			const line = editor.getLine(cursor.line)

			const hintOptions = {
				completeSingle: false,
				closeCharacters: /[\s()\[\]{};:>,]/,
				alignWithWord: true,
			}

			// 1. Ưu tiên HTML Class Attribute
			// Kiểm tra bằng logic mới trong getClassHints
			const htmlHints = getClassHints(editor)
			if (htmlHints && htmlHints.list.length > 0) {
				CodeMirror.showHint(editor, () => htmlHints, hintOptions)
				return
			}

			// 2. JS Context
			if (isJsContext(editor)) {
				CodeMirror.showHint(editor, getJsHints, hintOptions)
				return
			}

			// 3. CSS/SCSS Context (SỬA ĐỔI QUAN TRỌNG)
			if (isCssContext(editor)) {
				// Dùng hàm wrapper mới để support cả Class name
				CodeMirror.showHint(editor, getCssScssHints, hintOptions)
				return
			}

			// 4. HTML Tag Hints (Fallback)
			const token = editor.getTokenAt(cursor)
			const inner = CodeMirror.innerMode(editor.getMode(), token.state)

			if (inner.mode.name === 'xml') {
				let htmlResult = null
				try {
					htmlResult = CodeMirror.hint.html(editor, hintOptions)
				} catch (e) {}

				if (htmlResult && htmlResult.list && htmlResult.list.length > 0) {
					CodeMirror.showHint(editor, CodeMirror.hint.html, hintOptions)
					return
				}
			}

			if (isAuto) return
			CodeMirror.showHint(editor, CodeMirror.hint.anyword, hintOptions)
		}

		extraKeys['Ctrl-S'] = function (editor) {
			try {
				handleCtrlS(editor)
			} catch (e) {
				console.error('Error scan and save current css class')
			} finally {
				document.getElementById('save-button').click()
			}
		}
		extraKeys['Ctrl-Space'] = function (editor) {
			triggerIntelliSense(editor, false)
		}
		cm.setOption('extraKeys', extraKeys)

		cm.on('inputRead', function (editor, change) {
			// Đảm bảo $ được kích hoạt auto hint
			const validTrigger = /[a-zA-Z0-9_\.\-\$#@]/
			if (change.origin === '+input' && change.text[0] && validTrigger.test(change.text[0])) {
				setTimeout(() => {
					triggerIntelliSense(editor, true)
				}, 20)
			}

			if (debounceScanTimer) clearTimeout(debounceScanTimer)
			debounceScanTimer = setTimeout(() => {
				performFullScan(editor)
			}, 1500)
		})

		cm.on('cursorActivity', instance => {
			const inJS = isJsContext(instance)
			const inCSS = isCssContext(instance)

			if (instance._wasInJsBlock && !inJS) scanLocalJS(instance)
			instance._wasInJsBlock = inJS
			instance._wasInCssBlock = inCSS
		})

		cm.on('blur', () => {
			performFullScan(cm)
		})
		cm._hasAllInOneHook = true
	}

	// --- 7. INITIALIZATION ---
	function loadLibs() {
		if (!document.getElementById('custom-intelligent-css')) {
			var c = document.createElement('style')
			c.id = 'custom-intelligent-css'
			c.textContent = `/* show-hint.min.css */
      .CodeMirror-hints{position:absolute;z-index:10;overflow:hidden;list-style:none;margin:0;padding:2px;-webkit-box-shadow:2px 3px 5px rgba(0,0,0,.2);-moz-box-shadow:2px 3px 5px rgba(0,0,0,.2);box-shadow:2px 3px 5px rgba(0,0,0,.2);border-radius:3px;border:1px solid silver;background:#fff;font-size:90%;font-family:monospace;max-height:20em;overflow-y:auto;box-sizing:border-box}.CodeMirror-hint{margin:0;padding:0 4px;border-radius:2px;white-space:pre;color:#000;cursor:pointer}li.CodeMirror-hint-active{background:#08f;color:#fff}`
			document.head.appendChild(c)
		}
		startObserver()
	}

	function init() {
		loadLibs()
		waitLoadElement('#asset-list-container li a', function () {
			initCSSManager()
		})

		const customStyle = document.createElement('style')
		customStyle.innerHTML = `
            .CodeMirror-hints { z-index: 999999 !important; font-family: 'Consolas', monospace; font-size: 13px; }
            .CodeMirror-hint-active { background: #0084ff !important; color: white !important; }
        `
		document.head.appendChild(customStyle)
	}

	function startObserver() {
		const observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				mutation.addedNodes.forEach(node => {
					if (node.nodeType === 1) {
						if (node.classList.contains('CodeMirror') && node.CodeMirror) {
							applyConfigToCodeMirror(node.CodeMirror)
						} else {
							node.querySelectorAll('.CodeMirror').forEach(cmEl => {
								if (cmEl.CodeMirror) applyConfigToCodeMirror(cmEl.CodeMirror)
							})
						}
					}
				})
			})
		})
		observer.observe(document.body, { childList: true, subtree: true })
		document.querySelectorAll('.CodeMirror').forEach(cmEl => {
			if (cmEl.CodeMirror) {
				applyConfigToCodeMirror(cmEl.CodeMirror)
			}
		})
	}
	if (!window.__loaded) {
		window.__loaded = true
		waitLoadElement('.CodeMirror', function () {
			document.querySelectorAll('.CodeMirror').forEach(cmEl => {
				if (cmEl.CodeMirror) {
					applyConfigToCodeMirror(cmEl.CodeMirror)
					setTimeout(init, 2000)
				}
			})
		})
	}
})()
