const customerModel = require('../models/customer.model');

async function handleOrderCreated(orderData) {
  console.log('Order created:', orderData.id);

  try {
    const { customer, line_items, note_attributes } = orderData;

    if (customer) {
      await customerModel.upsert({
        shopify_customer_id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
      });

      const fitProfileId = note_attributes?.find(
        attr => attr.name === 'fit_profile_id'
      )?.value;

      if (fitProfileId) {
        console.log('Order has custom fit profile:', fitProfileId);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling order:', error);
    throw error;
  }
}

async function handleCustomerCreated(customerData) {
  console.log('Customer created:', customerData.id);

  try {
    await customerModel.upsert({
      shopify_customer_id: customerData.id,
      email: customerData.email,
      first_name: customerData.first_name,
      last_name: customerData.last_name,
      phone: customerData.phone,
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

module.exports = {
  handleOrderCreated,
  handleCustomerCreated,
};
