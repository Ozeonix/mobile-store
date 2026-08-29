const db = require('../db');

exports.getContactPage = (req, res) => {
  res.render('contact', {
    title: 'Store Location & Contact — Tech Talk Mobile Brookefield AECS Layout',
    page: 'contact',
    successMsg: req.query.msg || null
  });
};

exports.submitInquiry = async (req, res) => {
  try {
    const { customer_name, phone, product_name, message } = req.body;

    if (!customer_name || !phone || !message) {
      return res.redirect('/contact?msg=Please+fill+all+required+fields');
    }

    await db.query(
      `INSERT INTO inquiries (customer_name, phone, product_name, message, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [customer_name.trim(), phone.trim(), product_name ? product_name.trim() : 'General Inquiry', message.trim(), 'pending']
    );

    res.redirect('/contact?msg=Thank+you!+Our+team+will+call+or+WhatsApp+you+shortly.');
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    res.redirect('/contact?msg=Error+sending+inquiry.+Please+try+again.');
  }
};
