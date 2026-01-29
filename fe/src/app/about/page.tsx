// AI Generated Code by Deloitte + Cursor (BEGIN)
import { Target, Users, Award, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About DevTools Nexus
          </h1>
          <p className="text-xl text-blue-100">
            Your trusted source for AI developer tool reviews and guides
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              We help developers discover, evaluate, and choose the best AI-powered tools to enhance their productivity and workflow. Through comprehensive reviews, hands-on testing, and practical guides, we make it easier for developers to navigate the rapidly evolving landscape of AI development tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <div className="bg-blue-50 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-600">
                To be the go-to resource for developers seeking to leverage AI tools effectively, making technology choices simpler and more informed.
              </p>
            </div>

            <div className="bg-purple-50 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Values</h3>
              <p className="text-gray-600">
                Transparency, thorough testing, unbiased reviews, and a commitment to helping developers make the best decisions for their projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Tools Reviewed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100K+</div>
              <div className="text-gray-600">Monthly Readers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">200+</div>
              <div className="text-gray-600">Articles Published</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">4.8★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Review Tools</h2>
            <p className="text-xl text-gray-600">
              Our comprehensive review process ensures you get accurate, reliable information
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Hands-On Testing',
                description: 'We use each tool extensively in real-world development scenarios for at least 2-4 weeks.'
              },
              {
                step: '2',
                title: 'Comprehensive Analysis',
                description: 'We evaluate features, performance, pricing, support, and integration capabilities.'
              },
              {
                step: '3',
                title: 'Expert Review',
                description: 'Our team of experienced developers provides honest, unbiased assessments and recommendations.'
              }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-xl text-gray-600">
              Experienced developers and AI enthusiasts passionate about productivity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Johnson', role: 'Lead Reviewer', img: 'https://i.pravatar.cc/150?img=5' },
              { name: 'Michael Chen', role: 'Senior Writer', img: 'https://i.pravatar.cc/150?img=12' },
              { name: 'Alex Rodriguez', role: 'Technical Editor', img: 'https://i.pravatar.cc/150?img=8' }
            ].map((member, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl text-center shadow-md">
                <img 
                  src={member.img}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
// AI Generated Code by Deloitte + Cursor (END)
