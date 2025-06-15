import React from 'react';

const UserAgreement = () => {
  // Get current year for copyright notices
  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Terms of Service Agreement</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-8">
        <p className="text-sm italic">
          Last Updated: August 1, {currentYear}
        </p>
      </div>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">
          Welcome to Steppers Life. These Terms of Service ("Terms") govern your access to and use of 
          the Steppers Life website, mobile applications, and services (collectively, the "Platform").
        </p>
        <p className="mb-4">
          By accessing or using our Platform, you agree to be bound by these Terms and our Privacy Policy. 
          If you do not agree to these Terms, you may not access or use the Platform.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>"Account"</strong> means a user account on the Platform.</li>
          <li><strong>"Content"</strong> means any information, text, graphics, photos, or other materials uploaded, downloaded, or appearing on the Platform.</li>
          <li><strong>"User"</strong> means any individual who accesses or uses the Platform.</li>
          <li><strong>"Organizer"</strong> means a User who creates or manages events on the Platform.</li>
          <li><strong>"Attendee"</strong> means a User who registers for or purchases tickets to events on the Platform.</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Account Registration and Security</h2>
        <p className="mb-4">
          To access certain features of the Platform, you must register for an Account. You agree to provide 
          accurate, current, and complete information during the registration process and to update such 
          information to keep it accurate, current, and complete.
        </p>
        <p className="mb-4">
          You are responsible for safeguarding your password and for all activities that occur under your Account. 
          You agree to notify us immediately of any unauthorized use of your Account.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
        <p className="mb-4">
          You agree not to use the Platform to:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Violate any applicable law or regulation.</li>
          <li>Infringe the rights of any third party, including intellectual property rights.</li>
          <li>Harass, abuse, or harm another person.</li>
          <li>Post or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</li>
          <li>Impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
          <li>Interfere with or disrupt the Platform or servers or networks connected to the Platform.</li>
          <li>Collect or store personal data about other users without their consent.</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Events and Ticketing</h2>
        <h3 className="text-xl font-semibold mb-2">For Organizers:</h3>
        <p className="mb-4">
          Organizers are responsible for creating and managing their events, including setting ticket prices, 
          event details, and policies. Organizers must accurately represent their events and comply with all 
          applicable laws and regulations.
        </p>
        <p className="mb-4">
          We charge service fees for the use of our Platform. These fees will be clearly disclosed to you during 
          the event creation process.
        </p>
        
        <h3 className="text-xl font-semibold mb-2 mt-6">For Attendees:</h3>
        <p className="mb-4">
          By purchasing tickets through our Platform, you agree to comply with all event policies, including 
          refund policies set by the Organizer. All sales are final unless otherwise stated by the Organizer.
        </p>
        <p className="mb-4">
          We are not responsible for the quality, safety, or legality of events or the accuracy of event 
          descriptions. We do not guarantee admission to any event, as this is at the discretion of the Organizer.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
        <p className="mb-4">
          The Platform and its original content, features, and functionality are owned by Steppers Life and are 
          protected by international copyright, trademark, patent, trade secret, and other intellectual property 
          or proprietary rights laws.
        </p>
        <p className="mb-4">
          By submitting Content to the Platform, you grant us a worldwide, non-exclusive, royalty-free license 
          to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and 
          display such Content in connection with providing the Platform.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
        <p className="mb-4">
          We may terminate or suspend your Account immediately, without prior notice or liability, for any 
          reason whatsoever, including without limitation if you breach these Terms.
        </p>
        <p className="mb-4">
          Upon termination, your right to use the Platform will immediately cease. If you wish to terminate 
          your Account, you may simply discontinue using the Platform or delete your Account.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
        <p className="mb-4">
          In no event shall Steppers Life, its directors, employees, partners, agents, suppliers, or affiliates, 
          be liable for any indirect, incidental, special, consequential, or punitive damages, including without 
          limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Your access to or use of or inability to access or use the Platform;</li>
          <li>Any conduct or content of any third party on the Platform;</li>
          <li>Any content obtained from the Platform; and</li>
          <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision 
          is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes 
          a material change will be determined at our sole discretion.
        </p>
        <p className="mb-4">
          By continuing to access or use our Platform after any revisions become effective, you agree to be bound 
          by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Platform.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about these Terms, please contact us at:
        </p>
        <p className="mb-4">
          <a href="mailto:support@stepperslife.com" className="text-blue-600 dark:text-blue-400 hover:underline">
            support@stepperslife.com
          </a>
        </p>
      </section>
    </div>
  );
};

export default UserAgreement; 