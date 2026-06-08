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
      liveVerification: {
        label: "Pay £1",
        hours: 0,
        amountPence: 100,
      },
      payPerLesson: {
        label: "Pay £74",
        hours: 2,
        amountPence: 7400,
      },
      tenHourPackage: {
        label: "Buy 10 hours",
        hours: 10,
        amountPence: 35000,
      },
    },
  },
};
