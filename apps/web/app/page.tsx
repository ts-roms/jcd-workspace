import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-950 dark:to-black">
      <main className="flex flex-col items-center justify-center text-center px-6 py-12 max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Welcome to Your App
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl">
          Get started with your dashboard and manage your data, analytics, and projects all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            Go to Dashboard
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="bg-gray-800/50 backdrop-blur p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-2">Analytics</h3>
            <p className="text-gray-400">Track your performance with detailed analytics and insights</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-2">Projects</h3>
            <p className="text-gray-400">Manage and organize all your projects in one place</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-2">Settings</h3>
            <p className="text-gray-400">Customize your experience with flexible settings</p>
          </div>
        </div>
      </main>
    </div>
  );
}
