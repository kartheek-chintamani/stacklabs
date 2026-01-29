// AI Generated Code by Deloitte + Cursor (BEGIN)
import Link from 'next/link';
import { Code, Zap, TestTube, GitBranch, Shield, Sparkles } from 'lucide-react';

export default function CategoriesPage() {
  const categories = [
    {
      name: 'AI Code Assistants',
      slug: 'code-assistants',
      description: 'AI-powered tools that help you write better code faster',
      icon: Code,
      color: 'blue',
      count: 12,
      tools: ['GitHub Copilot', 'Cursor AI', 'Tabnine', 'CodeWhisperer']
    },
    {
      name: 'Automation Tools',
      slug: 'automation',
      description: 'Workflow automation and task orchestration platforms',
      icon: Zap,
      color: 'purple',
      count: 8,
      tools: ['n8n', 'Zapier', 'Make', 'Activepieces']
    },
    {
      name: 'Testing & QA',
      slug: 'testing',
      description: 'Automated testing and quality assurance tools',
      icon: TestTube,
      color: 'green',
      count: 10,
      tools: ['Mabl', 'Testim', 'Cypress', 'Playwright']
    },
    {
      name: 'Code Review',
      slug: 'code-review',
      description: 'AI-powered code review and quality checking',
      icon: GitBranch,
      color: 'orange',
      count: 6,
      tools: ['CodeRabbit', 'DeepCode', 'Codacy', 'SonarQube']
    },
    {
      name: 'Security Tools',
      slug: 'security',
      description: 'Security scanning and vulnerability detection',
      icon: Shield,
      color: 'red',
      count: 9,
      tools: ['Snyk', 'GitGuardian', 'Checkmarx', 'Veracode']
    },
    {
      name: 'Productivity',
      slug: 'productivity',
      description: 'General developer productivity and workflow tools',
      icon: Sparkles,
      color: 'indigo',
      count: 15,
      tools: ['Pieces', 'Raycast', 'Warp', 'Fig']
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      icon: 'bg-blue-100',
      border: 'hover:border-blue-300'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      light: 'bg-purple-50',
      text: 'text-purple-600',
      icon: 'bg-purple-100',
      border: 'hover:border-purple-300'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      light: 'bg-green-50',
      text: 'text-green-600',
      icon: 'bg-green-100',
      border: 'hover:border-green-300'
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      light: 'bg-orange-50',
      text: 'text-orange-600',
      icon: 'bg-orange-100',
      border: 'hover:border-orange-300'
    },
    red: {
      bg: 'from-red-500 to-red-600',
      light: 'bg-red-50',
      text: 'text-red-600',
      icon: 'bg-red-100',
      border: 'hover:border-red-300'
    },
    indigo: {
      bg: 'from-indigo-500 to-indigo-600',
      light: 'bg-indigo-50',
      text: 'text-indigo-600',
      icon: 'bg-indigo-100',
      border: 'hover:border-indigo-300'
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Browse by Category
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore AI tools organized by functionality and use case. Find exactly what you need for your development workflow.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {categories.map((category) => {
          const Icon = category.icon;
          const colors = colorClasses[category.color as keyof typeof colorClasses];
          
          return (
            <Link 
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group"
            >
              <div className={`bg-white rounded-2xl p-8 border-2 border-gray-200 ${colors.border} hover:shadow-xl transition-all h-full flex flex-col`}>
                {/* Icon */}
                <div className={`w-16 h-16 ${colors.icon} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 ${colors.text}`} />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-4 flex-1">
                  {category.description}
                </p>

                {/* Count */}
                <div className="mb-4">
                  <span className={`${colors.light} ${colors.text} px-4 py-2 rounded-full text-sm font-semibold`}>
                    {category.count} tools
                  </span>
                </div>

                {/* Popular Tools */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">Popular:</div>
                  <div className="flex flex-wrap gap-2">
                    {category.tools.slice(0, 3).map((tool, i) => (
                      <span key={i} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Can't Find What You're Looking For?</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          We're constantly expanding our tool coverage. Have a specific category or tool you'd like us to review?
        </p>
        <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg">
          Request a Review
        </button>
      </div>
    </div>
  );
}
// AI Generated Code by Deloitte + Cursor (END)
