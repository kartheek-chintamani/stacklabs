export default function PrivacyPage() {
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="bg-white min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
                <div className="prose prose-lg text-gray-600">
                    <p className="mb-4 text-sm text-gray-500">Last updated: {currentDate}</p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
                    <p>
                        Welcome to DevTools Nexus ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website devtoolsnexus.com (the "Site").
                        Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
                    <p>
                        We may collect personal information that you voluntarily provide to us when you:
                    </p>
                    <ul className="list-disc list-inside mb-4 ml-4">
                        <li>Register on the Site</li>
                        <li>Subscribe to our newsletter</li>
                        <li>Contact us via our contact form</li>
                        <li>Participate in surveys or promotions</li>
                    </ul>
                    <p>
                        The personal information we collect may include names, email addresses, and other contact details.
                        <strong>Automatically Collected Information:</strong> We automatically collect certain information when you visit, use, or navigate the Site. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Site, and other technical information.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
                    <p>
                        We use the information we collect or receive to:
                    </p>
                    <ul className="list-disc list-inside mb-4 ml-4">
                        <li>Facilitate account creation and logon process.</li>
                        <li>Send you marketing and promotional communications.</li>
                        <li>Respond to user inquiries/offer support.</li>
                        <li>Improve our website and user experience.</li>
                        <li>Monitor and analyze usage and trends.</li>
                        <li>Protect our Site and enforce our terms.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Cookies and Tracking Technologies</h2>
                    <p>
                        We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information.
                        Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Policy.
                        Most Web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Third-Party Websites</h2>
                    <p>
                        The Site may contain advertisements from third parties that are not affiliated with us and which may link to other websites, online services, or mobile applications.
                        We cannot guarantee the safety and privacy of data you provide to any third parties. Any data collected by third parties is not covered by this privacy policy. We are not responsible for the content or privacy and security practices and policies of any third parties.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Security of Your Information</h2>
                    <p>
                        We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Policy for Children</h2>
                    <p>
                        We do not knowingly solicit information from or market to children under the age of 13. If we learn that we have collected personal information from a child under age 13 without verification of parental consent, we will delete that information as quickly as possible.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Controls for Do-Not-Track Features</h2>
                    <p>
                        Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Your Privacy Rights</h2>
                    <p>
                        Depending on your location (e.g., California (CCPA) or European Economic Area (GDPR)), you may have specific rights regarding your personal information, such as the right to access, correct, delete, or port your data. To exercise these rights, please contact us at the details provided below.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
                    <p>
                        If you have questions or comments about this policy, you may email us at privacy@devtoolsnexus.com or by post to:
                        <br />
                        <strong>DevTools Nexus</strong><br />
                        123 Innovation Drive<br />
                        Tech City, TC 90210
                    </p>
                </div>
            </div>
        </div>
    );
}
