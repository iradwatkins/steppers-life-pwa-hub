import React from 'react';

const AboutUs = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">About Steppers Life</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-lg mb-4">
          Steppers Life is dedicated to uniting and empowering the dance community worldwide. 
          We provide a comprehensive platform that connects dancers, instructors, event organizers, 
          and dance-related businesses, creating a vibrant ecosystem for all aspects of dance culture.
        </p>
        <p className="text-lg mb-4">
          Our mission is to make dance more accessible, enjoyable, and rewarding for everyone involved, 
          from beginners taking their first steps to professional dancers and event organizers.
        </p>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
        <p className="text-lg mb-4">
          Founded in 2023, Steppers Life began with a simple observation: the dance community needed 
          a better way to connect, share information, and grow. What started as a basic event listing 
          platform has evolved into a comprehensive ecosystem serving all aspects of dance culture.
        </p>
        <p className="text-lg mb-4">
          Our team consists of passionate dancers, experienced event organizers, and talented 
          technologists who understand the unique needs of the dance community. This combination 
          of expertise allows us to create solutions that truly serve our users.
        </p>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Dancers</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Discover and book dance events</li>
              <li>Find dance classes and workshops</li>
              <li>Connect with the community</li>
              <li>Access educational content</li>
              <li>Shop dance-related products</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Organizers</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Create and manage events</li>
              <li>Sell tickets with flexible options</li>
              <li>Manage attendees and check-ins</li>
              <li>Promote events to targeted audiences</li>
              <li>Access analytics and reporting tools</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Community First</h3>
            <p>We prioritize the needs of the dance community in everything we do, fostering connection and collaboration.</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Innovation</h3>
            <p>We continuously improve our platform with cutting-edge technology to better serve our users.</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Inclusion</h3>
            <p>We celebrate diversity and work to make dance accessible to everyone, regardless of background or experience level.</p>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
        <p className="text-lg mb-6">
          Whether you're a dancer looking for events, an instructor sharing your knowledge, 
          or an organizer creating amazing experiences, Steppers Life is your platform. 
          Join us in building the future of dance together.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/auth/register" className="px-6 py-3 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark transition">
            Create an Account
          </a>
          <a href="/events" className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            Explore Events
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutUs; 