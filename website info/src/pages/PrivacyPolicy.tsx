import React from 'react';

const PrivacyPolicy = () => {
  // Get current year for copyright notices
  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-8">
        <p className="text-sm italic">
          Last Updated: August 1, {currentYear}
        </p>
      </div>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">
          At Steppers Life, we take your privacy seriously. This Privacy Policy explains how we collect, 
          use, disclose, and safeguard your information when you visit our website, mobile application, 
          and use our services (collectively, the "Platform").
        </p>
        <p className="mb-4">
          Please read this Privacy Policy carefully. By accessing or using our Platform, you acknowledge 
          that you have read, understood, and agree to be bound by all the terms outlined in this Privacy Policy.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
        
        <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
        <p className="mb-4">
          We may collect personal information that you voluntarily provide to us when you:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Register for an account</li>
          <li>Purchase tickets or register for events</li>
          <li>Sign up for our newsletter</li>
          <li>Contact us with inquiries or feedback</li>
          <li>Participate in surveys, contests, or promotions</li>
          <li>Create or manage events as an organizer</li>
        </ul>
        <p className="mb-4">
          This information may include:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Name, email address, and phone number</li>
          <li>Billing and payment information</li>
          <li>Demographic information</li>
          <li>Social media account information</li>
          <li>Profile photos and preferences</li>
          <li>Any other information you choose to provide</li>
        </ul>
        
        <h3 className="text-xl font-semibold mb-2 mt-6">Automatically Collected Information</h3>
        <p className="mb-4">
          When you access our Platform, we may automatically collect certain information, including:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>IP address and device information</li>
          <li>Browser type and version</li>
          <li>Operating system</li>
          <li>Access times and pages viewed</li>
          <li>Referral source and entry/exit pages</li>
          <li>Location information (if enabled on your device)</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
        <p className="mb-4">
          We may use the information we collect for various purposes, including to:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Provide, maintain, and improve our Platform</li>
          <li>Process transactions and send related information</li>
          <li>Create and manage your account</li>
          <li>Send administrative information, such as updates, security alerts, and support messages</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>Send promotional communications, such as event recommendations and marketing materials</li>
          <li>Monitor and analyze trends, usage, and activities on our Platform</li>
          <li>Detect, prevent, and address technical issues, fraud, or illegal activities</li>
          <li>Personalize and improve your experience on our Platform</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. How We Share Your Information</h2>
        <p className="mb-4">
          We may share your information in the following circumstances:
        </p>
        
        <h3 className="text-xl font-semibold mb-2">With Event Organizers</h3>
        <p className="mb-4">
          When you register for or purchase tickets to an event, we share your information with the event 
          organizer to facilitate your participation in the event and for the organizer's own marketing purposes.
        </p>
        
        <h3 className="text-xl font-semibold mb-2 mt-4">With Service Providers</h3>
        <p className="mb-4">
          We may share your information with third-party vendors, service providers, contractors, or agents 
          who perform services for us or on our behalf, such as payment processing, data analysis, email 
          delivery, hosting services, customer service, and marketing assistance.
        </p>
        
        <h3 className="text-xl font-semibold mb-2 mt-4">For Legal Purposes</h3>
        <p className="mb-4">
          We may disclose your information if required to do so by law or in response to valid requests by 
          public authorities (e.g., a court or government agency). We may also disclose your information to:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Enforce our Terms of Service and other agreements</li>
          <li>Protect and defend our rights or property</li>
          <li>Prevent or investigate possible wrongdoing in connection with the Platform</li>
          <li>Protect the personal safety of users of the Platform or the public</li>
        </ul>
        
        <h3 className="text-xl font-semibold mb-2 mt-4">Business Transfers</h3>
        <p className="mb-4">
          If we are involved in a merger, acquisition, financing, or sale of all or a portion of our assets, 
          your information may be transferred as part of that transaction.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking Technologies</h2>
        <p className="mb-4">
          We use cookies and similar tracking technologies to track activity on our Platform and to hold certain 
          information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
        </p>
        <p className="mb-4">
          You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, 
          if you do not accept cookies, you may not be able to use some portions of our Platform.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Your Privacy Choices</h2>
        
        <h3 className="text-xl font-semibold mb-2">Account Information</h3>
        <p className="mb-4">
          You can review and update your account information by logging into your account. You may also delete 
          your account, but note that some information may remain in our records after your account is deleted.
        </p>
        
        <h3 className="text-xl font-semibold mb-2 mt-4">Marketing Communications</h3>
        <p className="mb-4">
          You can opt out of receiving promotional emails from us by following the unsubscribe instructions 
          included in those emails. Even if you opt out, we may still send you non-promotional communications, 
          such as those about your account or our ongoing business relations.
        </p>
        
        <h3 className="text-xl font-semibold mb-2 mt-4">Your Rights</h3>
        <p className="mb-4">
          Depending on your location, you may have the following rights regarding your personal information:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Access and obtain a copy of your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Delete your personal information</li>
          <li>Object to or restrict the processing of your information</li>
          <li>Data portability</li>
          <li>Withdraw consent</li>
        </ul>
        <p className="mt-4 mb-4">
          To exercise these rights, please contact us using the information provided in the "Contact Us" section.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
        <p className="mb-4">
          We have implemented appropriate technical and organizational measures to protect the security of your 
          personal information. However, please be aware that no method of transmission over the Internet or 
          method of electronic storage is 100% secure.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
        <p className="mb-4">
          Our Platform is not intended for children under the age of 13. We do not knowingly collect personal 
          information from children under 13. If you are a parent or guardian and you are aware that your child 
          has provided us with personal information, please contact us.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Changes to This Privacy Policy</h2>
        <p className="mb-4">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the 
          new Privacy Policy on this page and updating the "Last Updated" date at the top of this page.
        </p>
        <p className="mb-4">
          You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy 
          Policy are effective when they are posted on this page.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <p className="mb-4">
          <a href="mailto:privacy@stepperslife.com" className="text-blue-600 dark:text-blue-400 hover:underline">
            privacy@stepperslife.com
          </a>
        </p>
        <p className="mb-4">
          Steppers Life<br />
          123 Dance Avenue<br />
          San Francisco, CA 94103<br />
          United States
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy; 