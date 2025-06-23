export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  message: string;
}

const contactHandler = async (
  data: ContactFormData
): Promise<{ success: boolean; message: string }> => {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Basic validation
  if (!data.name || !data.email || !data.message) {
    return {
      success: false,
      message: "Please fill in all required fields.",
    };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      success: false,
      message: "Please enter a valid email address.",
    };
  }

  // In a real application, you would:
  // 1. Save to database
  // 2. Send email notification
  // 3. Send confirmation email to user

  console.log("Contact form submission:", {
    timestamp: new Date().toISOString(),
    data,
  });

  return {
    success: true,
    message:
      "Thank you for your message. We'll get back to you within 24 hours.",
  };
};

export default contactHandler;
