# prettier-plugin-liquid-1.10.0
prettier-plugin-liquid-use-with-tampermonkey

# Require install
1. Prettier core
2. prettier-plugin-liquid

# Get Code Mirror value
///
let cm = document.querySelector('.CodeMirror')
if (!cm) return null
let content = cm.getValue()
///
# Format with prettier
///
  // ===== Format Liquid bằng Prettier =====
  async function formatLiquid(text) {
    const options = {
      parser: "liquid-html", 
      plugins: [prettierPluginLiquid]
      }
    return await prettier.format(text, options)
  }
///
# Set new value to Code Mirror
///
  try {
    formatted = await formatLiquid(content)
  } catch (e) {
    console.error('Liquid format error:', e)
    alert('Lỗi format Liquid, xem console để biết chi tiết.')
    return
  }
  cm.setValue(formatted)
  cm.refresh()
///
# Overide prettier config
  add options to prettier.format

  ///
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
  
  htmlWhitespaceSensitivity: "ignore",
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
  
  trailingComma: "all",
  // Thêm dấu phẩy cuối trong object/array/function.
  // Giúp diff git đẹp hơn, code dễ merge.
  
  useTabs: true,
  // Thụt dòng bằng ký tự tab (\t) thay vì 2 hoặc 4 spaces.
///
# Link
[https://shopify.dev/docs/storefronts/themes/tools/liquid-prettier-plugin#use-the-plugin-with-a-bundler](https://shopify.dev/docs/storefronts/themes/tools/liquid-prettier-plugin#use-the-plugin-in-the-browser)

