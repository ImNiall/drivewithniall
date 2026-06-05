window.driveAuthConfig = {
  supabaseUrl: "https://antykaonrraerlmwpmqp.supabase.co",
  supabaseAnonKey: "sb_publishable_apDw466I44_8yXGZjMrN7g_08EAvrYz",
  siteUrl: "https://drivewithniall.co.uk/",
  adminName: "ImNiall's Project",
  adminUsername: "ImNiall's Project",
  adminUsernameEmail: "niallcullen.business@gmail.com",
  adminEmails: ["niallcullen.business@gmail.com", "contact@drivewithniall.co.uk"],
  payments: {
    createCheckoutFunction: "create-checkout-session",
    plans: {
      payPerLesson: {
        label: "Pay £35",
        hours: 1,
        amountPence: 3500,
      },
      tenHourPackage: {
        label: "Buy 10 hours",
        hours: 10,
        amountPence: 32500,
      },
    },
  },
};
