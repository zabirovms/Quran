import { Link } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { GlobalOverlayType } from '@/App';

interface PrivacyProps {
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

export default function Privacy({ onOpenOverlay }: PrivacyProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenOverlay={onOpenOverlay} />
      
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 md:p-12">
              <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 text-center border-b-4 border-green-700 dark:border-green-400 pb-4 mb-8">
                Privacy Policy
              </h1>
              
              <p className="text-center text-lg mb-8 font-medium text-gray-700 dark:text-gray-300">
                Қуръон бо Тафсири Осонбаён
              </p>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border-l-4 border-green-700 dark:border-green-400 mb-8">
                <div className="font-semibold text-green-800 dark:text-green-300 mb-2">
                  <strong>Last Updated:</strong> October 2025<br />
                  <strong>Effective Date:</strong> October 2025<br />
                  <strong>App Version:</strong> 1.0.0
                </div>
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-8 mb-4 border-l-4 border-green-700 dark:border-green-400 pl-4">
                  1. Introduction
                </h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  Welcome to <strong>Қуръон бо Тафсири Осонбаён</strong> (Quran with Easy Commentary), a comprehensive mobile application designed to help users read, understand, and study the Holy Quran in Tajik language. This Privacy Policy explains how we collect, use, store, and protect your information when you use our mobile application.
                </p>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  We are committed to protecting your privacy and ensuring the security of your personal information. This app is designed with privacy-first principles, collecting minimal data necessary for functionality.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-8 mb-4 border-l-4 border-green-700 dark:border-green-400 pl-4">
                  2. Information We Collect
                </h2>
                
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-6 mb-3">
                  2.1 Local Data Storage
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  Our app stores the following data locally on your device:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>User Preferences:</strong> App settings, theme preferences, font sizes, language settings</li>
                  <li><strong>Bookmarks:</strong> Verses you have bookmarked for easy access</li>
                  <li><strong>Reading Progress:</strong> Last read surah and verse position</li>
                  <li><strong>Search History:</strong> Recent search queries (stored locally only)</li>
                  <li><strong>Tasbeeh Counters:</strong> Your dhikr counting progress</li>
                  <li><strong>Audio Settings:</strong> Reciter preferences and audio playback settings</li>
                  <li><strong>Image Download Permissions:</strong> Your choice regarding image downloads</li>
                </ul>

                <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-6 mb-3">
                  2.2 Generated User ID
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  We generate a unique, anonymous user ID (e.g., "user_1234567890") to:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Associate your bookmarks and preferences with your device</li>
                  <li>Maintain your reading progress across app sessions</li>
                  <li>Provide personalized app experience</li>
                </ul>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>This ID is completely anonymous and contains no personal information.</strong>
                </p>

                <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-6 mb-3">
                  2.3 No Personal Information Collected
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  We do <strong>NOT</strong> collect:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Your name, email address, or phone number</li>
                  <li>Location data or GPS coordinates</li>
                  <li>Contact lists or device contacts</li>
                  <li>Photos or media files from your device</li>
                  <li>Biometric data or device identifiers</li>
                  <li>Any personally identifiable information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-8 mb-4 border-l-4 border-green-700 dark:border-green-400 pl-4">
                  3. How We Use Your Information
                </h2>
                
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-6 mb-3">
                  3.1 Local Functionality
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  All collected data is used exclusively for:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Providing Quran reading and study features</li>
                  <li>Maintaining your bookmarks and reading progress</li>
                  <li>Remembering your app preferences and settings</li>
                  <li>Enabling offline functionality</li>
                  <li>Improving your user experience within the app</li>
                </ul>

                <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-6 mb-3">
                  3.2 External Services
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  Our app connects to the following external services:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>AlQuran Cloud API:</strong> For Quranic audio recitations</li>
                  <li><strong>Supabase:</strong> For Quranic text and translations</li>
                  <li><strong>Google Cloud Storage:</strong> For Islamic images (with permission)</li>
                </ul>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  These connections are made anonymously and do not transmit your personal data.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-8 mb-4 border-l-4 border-green-700 dark:border-green-400 pl-4">
                  4. Data Storage and Security
                </h2>
                
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-6 mb-3">
                  4.1 Local Storage
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  All your data is stored locally on your device using:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>SQLite Database:</strong> For bookmarks and structured data</li>
                  <li><strong>Hive Database:</strong> For app settings and preferences</li>
                  <li><strong>SharedPreferences:</strong> For simple key-value storage</li>
                </ul>

                <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-6 mb-3">
                  4.2 Data Security
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  We implement the following security measures:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>All data is encrypted at rest on your device</li>
                  <li>No data is transmitted to external servers without your explicit consent</li>
                  <li>Anonymous user IDs are generated locally and never shared</li>
                  <li>Image downloads require explicit user permission</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-8 mb-4 border-l-4 border-green-700 dark:border-green-400 pl-4">
                  5. Permissions We Request
                </h2>
                
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-6 mb-3">
                  5.1 Android Permissions
                </h3>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>INTERNET:</strong> To download Quranic audio and text updates</li>
                  <li><strong>WAKE_LOCK:</strong> To continue audio playback when screen is off</li>
                  <li><strong>FOREGROUND_SERVICE:</strong> For background audio playback</li>
                  <li><strong>WRITE_EXTERNAL_STORAGE:</strong> To save downloaded audio files</li>
                  <li><strong>READ_EXTERNAL_STORAGE:</strong> To access saved audio files</li>
                </ul>

                <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-6 mb-3">
                  5.2 iOS Permissions
                </h3>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>Audio Background Mode:</strong> For continuous audio playback</li>
                  <li><strong>Network Access:</strong> For downloading Quranic content</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-8 mb-4 border-l-4 border-green-700 dark:border-green-400 pl-4">
                  6. Third-Party Services
                </h2>
                
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-6 mb-3">
                  6.1 External APIs
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  Our app uses these third-party services:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>AlQuran Cloud API:</strong> Provides Quranic audio recitations</li>
                  <li><strong>Supabase:</strong> Provides Quranic text and Tajik translations</li>
                  <li><strong>Google Cloud Storage:</strong> Hosts Islamic educational images</li>
                </ul>

                <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-6 mb-3">
                  6.2 Data Sharing
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  We do <strong>NOT</strong> share your personal data with third parties. Any data transmitted to external services is:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Anonymous and non-identifiable</li>
                  <li>Limited to Quranic content requests</li>
                  <li>Not linked to your personal information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-8 mb-4 border-l-4 border-green-700 dark:border-green-400 pl-4">
                  7. Your Rights and Choices
                </h2>
                
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-6 mb-3">
                  7.1 Data Control
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  You have complete control over your data:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>Delete Bookmarks:</strong> Remove bookmarks individually or all at once</li>
                  <li><strong>Clear Search History:</strong> Remove all search history</li>
                  <li><strong>Reset App Data:</strong> Clear all local data and start fresh</li>
                  <li><strong>Image Downloads:</strong> Control whether images are downloaded</li>
                </ul>

                <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-6 mb-3">
                  7.2 App Uninstallation
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  When you uninstall the app, all your local data is automatically deleted from your device.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-8 mb-4 border-l-4 border-green-700 dark:border-green-400 pl-4">
                  8. Children's Privacy
                </h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  Our app is suitable for users of all ages. We do not knowingly collect personal information from children under 13. Since we don't collect personal information from any users, this policy applies equally to all age groups.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-8 mb-4 border-l-4 border-green-700 dark:border-green-400 pl-4">
                  9. Data Retention
                </h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  Your data is retained only as long as:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>You continue to use the app</li>
                  <li>The app remains installed on your device</li>
                  <li>You choose to keep your bookmarks and preferences</li>
                </ul>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  You can delete your data at any time through the app settings or by uninstalling the app.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-8 mb-4 border-l-4 border-green-700 dark:border-green-400 pl-4">
                  10. International Users
                </h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  This app is designed for Tajik-speaking users worldwide. All data processing occurs locally on your device, ensuring compliance with international privacy laws including GDPR, CCPA, and other regional privacy regulations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-8 mb-4 border-l-4 border-green-700 dark:border-green-400 pl-4">
                  11. Updates to This Policy
                </h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Posting the new Privacy Policy on our website</li>
                  <li>Updating the "Last Updated" date at the top of this policy</li>
                  <li>Including a notice in the app for significant changes</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-8 mb-4 border-l-4 border-green-700 dark:border-green-400 pl-4">
                  12. Contact Information
                </h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mt-6">
                  <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li><strong>Website:</strong> <a href="https://www.quran.tj/" className="text-blue-600 dark:text-blue-400 hover:underline">https://www.quran.tj/</a></li>
                    <li><strong>Email:</strong> privacy@quran.tj</li>
                    <li><strong>App Name:</strong> Қуръон бо Тафсири Осонбаён</li>
                    <li><strong>Version:</strong> 1.0.0</li>
                  </ul>
                </div>
              </section>

              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border-l-4 border-green-700 dark:border-green-400 mb-8">
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mb-4">Summary</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>Your privacy is our priority.</strong> This app:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✅ Stores all data locally on your device</li>
                  <li>✅ Does not collect personal information</li>
                  <li>✅ Uses anonymous identifiers only</li>
                  <li>✅ Requires explicit permission for downloads</li>
                  <li>✅ Allows you to delete all data at any time</li>
                  <li>✅ Works offline without internet dependency</li>
                </ul>
              </div>

              <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
                <p className="italic mb-2">This Privacy Policy was last updated on October 2025</p>
                <p>© 2025 Қуръон бо Тафсири Осонбаён. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
