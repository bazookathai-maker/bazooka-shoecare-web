const KNOWN_EN = {
  'กรุณากรอกชื่อ': 'Please enter your first name',
  'กรุณากรอกนามสกุล': 'Please enter your last name',
  'กรุณากรอกชื่อ-นามสกุล': 'Please enter your full name',
  'กรุณากรอกอีเมล': 'Please enter your email',
  'รูปแบบอีเมลไม่ถูกต้อง': 'That email address is not valid',
  'กรุณากรอกเบอร์โทรศัพท์': 'Please enter your phone number',
  'เบอร์โทรศัพท์ต้องมี 9–10 หลัก': 'The phone number must be 9–10 digits',
  'กรุณากรอกที่อยู่': 'Please enter your address',
  'กรุณาเลือกจังหวัด': 'Please choose a province',
  'ไม่สามารถแปลงจังหวัดเป็นรหัสสำหรับ WooCommerce ได้':
    'This province could not be matched to a shipping code',
  'กรุณาเลือกเขต/อำเภอ': 'Please choose a district',
  'กรุณาเลือกแขวง/ตำบล': 'Please choose a subdistrict',
  'กรุณากรอกรหัสไปรษณีย์': 'Please enter the postal code',
  'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก': 'The postal code must be 5 digits',
  'กรุณากรอกข้อมูลให้ครบ': 'Please complete the required fields',
  'อัปเดตข้อมูลลูกค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง':
    'The customer details could not be updated. Please try again.',
  'ไม่มีสินค้าในตะกร้า': 'Your cart is empty',
  'รองรับเฉพาะชำระด้วยพร้อมเพย์ผ่าน Stripe':
    'Only PromptPay through Stripe is available',
  'กำลังสร้างคำสั่งซื้อใน WooCommerce...': 'Creating the order...',
  'กำลังพาไปหน้าชำระเงิน Stripe...': 'Opening the Stripe payment page...',
  'ไม่พบ Stripe Checkout URL จากเซิร์ฟเวอร์':
    'The payment page could not be opened. Please try again.',
  'ยืนยันคำสั่งซื้อไม่สำเร็จ': 'The order could not be confirmed',
  'กำลังอัปเดตวิธีจัดส่ง...': 'Updating shipping...',
  'อัปเดตวิธีจัดส่งและยอดรวมแล้ว': 'Shipping and the total are updated',
  'เลือกวิธีจัดส่งไม่สำเร็จ': 'The shipping method could not be selected',
  'ไม่สามารถโหลดตะกร้าได้': 'The cart could not be loaded',
  'สินค้านี้ยังไม่พร้อมเพิ่มลงตะกร้า': 'This product cannot be added to the cart yet',
  'เพิ่มสินค้าลงตะกร้าไม่สำเร็จ': 'The product could not be added to the cart',
  'ไม่พบสินค้าในตะกร้า': 'That item is no longer in the cart',
  'อัปเดตจำนวนสินค้าไม่สำเร็จ': 'The quantity could not be updated',
  'พร้อมเพย์ (Stripe)': 'PromptPay (Stripe)',
  'บันทึกข้อมูลไม่สำเร็จ': 'The details could not be saved',
  'บันทึกข้อมูลบัญชีไม่สำเร็จ': 'The account details could not be saved',
  'สมัครบัญชีไม่สำเร็จ': 'The account could not be created',
  'เข้าสู่ระบบไม่สำเร็จ': 'Sign-in failed',
  'เข้าสู่ระบบด้วย Google ไม่สำเร็จ': 'Google sign-in failed',
  'เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง':
    'Google sign-in failed. Please try again.',
  'สมัครด้วย Google ไม่สำเร็จ': 'Google sign-up failed',
  'สมัครด้วย Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง':
    'Google sign-up failed. Please try again.',
  'โหลดการตั้งค่า Google ไม่สำเร็จ': 'Google sign-in could not be loaded',
  'โหลดข้อมูลบัญชีไม่สำเร็จ': 'The account could not be loaded',
  'โหลดประวัติคำสั่งซื้อไม่สำเร็จ': 'Order history could not be loaded',
  'ตรวจสอบสถานะการชำระเงินไม่สำเร็จ': 'The payment status could not be checked',
  'ไม่พบคำสั่งซื้อ กรุณาตรวจสอบเลขคำสั่งซื้อหรือเบอร์โทรศัพท์อีกครั้ง':
    'No order was found. Please check the order number and phone number.',
  'ไม่พบคำสั่งซื้อ กรุณาตรวจสอบเบอร์โทรศัพท์อีกครั้ง':
    'No order was found. Please check the phone number.',
  'ไม่พบสินค้า': 'Product not found',
  'ไม่พบ package การจัดส่ง': 'No shipping package was found',
  'ไม่พบวิธีจัดส่ง': 'No shipping method was found',
  'รหัสสินค้าไม่ถูกต้อง': 'The product id is not valid',
  'ไม่พบรายการในตะกร้า': 'That cart item was not found',
  'รูปแบบข้อมูลสินค้าไม่ถูกต้อง': 'The product data is not valid',
  'ไม่มีสินค้าในตะกร้าสำหรับสร้างคำสั่งซื้อ': 'There are no items to place an order',
  'ไม่พบเลขที่คำสั่งซื้อสำหรับ Stripe Checkout':
    'The order number for payment was not found',
  'ไม่พบเส้นทางตะกร้า': 'The cart path was not found',
  'ล้างตะกร้าไม่สำเร็จ': 'The cart could not be cleared',
  'ไม่พบเลขที่คำสั่งซื้อจาก WooCommerce': 'The order number was not returned',
  'ไม่พบเลขที่คำสั่งซื้อจากเซิร์ฟเวอร์': 'The order number was not returned',
  'วิธีชำระเงินไม่ถูกต้อง — รองรับเฉพาะพร้อมเพย์ผ่าน Stripe':
    'Only PromptPay through Stripe is available',
  'รูปแบบข้อมูลบทความไม่ถูกต้อง': 'The article data is not valid',
  สินค้า: 'Product',
};

const KNOWN_EN_PREFIXES = [
  ['โหลดสินค้าไม่สำเร็จ', 'The products could not be loaded'],
  ['คำสั่งตะกร้าไม่สำเร็จ', 'The cart request failed'],
  ['สร้างคำสั่งซื้อไม่สำเร็จ', 'The order could not be created'],
  ['สร้าง Stripe Checkout ไม่สำเร็จ', 'The payment page could not be created'],
  ['โหลดข้อมูล WordPress ไม่สำเร็จ', 'The articles could not be loaded'],
  ['คาดหวัง stripe_promptpay แต่ได้ payment_method=', 'The payment method was not stripe_promptpay'],
];

export function translateKnown(locale, text) {
  if (locale !== 'en' || typeof text !== 'string' || !text) return text;
  if (KNOWN_EN[text]) return KNOWN_EN[text];
  const prefix = KNOWN_EN_PREFIXES.find(([thai]) => text.startsWith(thai));
  if (prefix) return prefix[1];
  if (text.startsWith('Order ถูกสร้างด้วย gateway ผิด')) {
    return 'The order was created with the wrong payment gateway. It must be stripe_promptpay.';
  }
  return text;
}
