# Prettier Liquid Plugin (v1.10.0) – Use with Tampermonkey + CodeMirror

This repository provides a complete setup for running **Prettier** and **prettier-plugin-liquid** directly inside the browser using **Tampermonkey**.  
It is fully compatible with:

- Shopify Theme Editor  
- Sapo Theme Editor  
- Any website using **CodeMirror 5**  
- Liquid / HTML / CSS / JS embedded inside Liquid  

You can format any Liquid file in the browser with one keyboard shortcut.

---

# 🚀 Features

- Run Prettier + Liquid plugin directly in the browser (no Node, no CLI)
- Supports Liquid, HTML, JS, CSS, and Vue blocks
- Works on **CodeMirror 5** editors
- Customizable Prettier configuration
- Trigger formatting via **Ctrl + Alt + F**
- Auto-update script via GitHub CDN (jsDelivr or raw)

---

# 📦 Installation (Tampermonkey)

1. Install **Tampermonkey**
2. Click **Create a new userscript**
3. Replace everything with:

```js
  // ==UserScript==
  // @name         Liquid Prettier Formatter
  // @match        *://*/*
  // @grant        none
  // @require      https://unpkg.com/prettier@3/standalone.js
  // @require      https://unpkg.com/prettier-plugin-liquid@1.10.0/dist/standalone.js
  // ==/UserScript==
```
# Get Code Mirror value 
```js
  let cm = document.querySelector('.CodeMirror')
  if (!cm) return null
  let content = cm.getValue()
```
# Format with prettier 
```js
  async function formatLiquid(text) {
    const options = {
      parser: "liquid-html",
      plugins: [prettierPluginLiquid]
    }
    return await prettier.format(text, options)
  }
```
# Set new value to Code Mirror 
```js
  try {
    formatted = await formatLiquid(content)
  } catch (e) {
    console.error('Liquid format error:', e)
    alert('Lỗi format Liquid, xem console để biết chi tiết.')
    return
  }
  cm.setValue(formatted)
  cm.refresh()
```
# Overide prettier config add options to prettier.format 
```js
  const options = {
		parser: 'liquid-html', // Parser Liquid + HTML, bắt buộc phải khai báo khi dùng plugin Liquid.

		plugins: [prettierPluginLiquid], // Plugin Liquid cho Prettier. Giúp parse Liquid ({{ }}, {% %}, schema,…)

		// ================= PRETTIER CORE =================
		bracketSameLine: true,
		// Để dấu ngoặc đóng `>` của thẻ HTML/JSX ở cùng dòng với nội dung cuối.
		// Ví dụ:
		// <Component>
		//   text
		// </Component>
		// → chuyển thành:
		// <Component>
		//   text</Component>

		bracketSpacing: true,
		// Thêm khoảng trắng trong object literal.
		// { a: 1 } thay vì {a:1}

		htmlWhitespaceSensitivity: 'ignore',
		// Bỏ qua xử lý khoảng trắng HTML theo CSS.
		// Giúp HTML không bị xuống dòng bất thường.

		jsxSingleQuote: true,
		// JSX dùng dấu nháy đơn.
		// <div class='box'> thay vì <div class="box">

		printWidth: 400,
		// Độ dài dòng tối đa.
		// 400 rất lớn → gần như không xuống dòng tự động.

		semi: false,
		// Không dùng dấu `;`.
		// const a = 1 thay vì const a = 1;

		singleAttributePerLine: false,
		// Không bắt HTML phải mỗi attribute 1 dòng.
		// <div a="1" b="2"> thay vì:
		// <div
		//    a="1"
		//    b="2"
		// >

		singleQuote: true,
		// Dùng dấu nháy đơn trong JS/HTML/Liquid.
		// 'text' thay vì "text"

		trailingComma: 'all',
		// Thêm dấu phẩy cuối trong object/array/function.
		// Giúp diff git đẹp hơn, code dễ merge.

		useTabs: true,
		// Thụt dòng bằng ký tự tab (\t) thay vì 2 hoặc 4 spaces.
	}
```
# Link tham khảo
https://shopify.dev/docs/storefronts/themes/tools/liquid-prettier-plugin#use-the-plugin-in-the-browser
