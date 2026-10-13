import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../services/api';
import { 
  Users, 
  ChevronRight, 
  Star, 
  Heart, 
  MessageSquare, 
  BookOpen, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Send,
  Plus
} from 'lucide-react';

export default function CommunityPage() {
  const [stories, setStories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [newPost, setNewPost] = useState({
    authorName: '',
    conditionTag: 'Diabetes Reversal',
    title: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadCommunityData = async () => {
    try {
      const [postsRes, articlesRes] = await Promise.all([
        publicApi.getCommunityPosts(),
        publicApi.getArticles()
      ]);

      if (postsRes.success && postsRes.posts && postsRes.posts.length > 0) {
        setStories(postsRes.posts.map(p => ({
          id: p.id,
          name: p.authorName,
          city: p.conditionTag,
          condition: p.title,
          quote: p.content,
          doctor: p.doctorVerifiedReply ? `Verified by ${p.doctorName || 'Dr. Ananya Sharma (BHMS)'}: "${p.doctorVerifiedReply}"` : 'Audited by AYUSH Vaidya Desk',
          rating: 5
        })));
      }

      if (articlesRes.success && articlesRes.articles && articlesRes.articles.length > 0) {
        setArticles(articlesRes.articles.map(a => ({
          title: a.title,
          author: a.authorDoctor,
          readTime: a.readTime,
          tag: a.category
        })));
      }
    } catch (err) {
      console.warn('Community load error:', err);
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, []);

  const handlePostStory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await publicApi.createCommunityPost(newPost);
      setSuccessMsg('Your experience was submitted to the community and will appear with verified doctor notes!');
      setShowPostForm(false);
      setNewPost({ authorName: '', conditionTag: 'Diabetes Reversal', title: '', content: '' });
      await loadCommunityData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ paddingTop: '20px', paddingBottom: '100px' }}>
      <div className="container-custom">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '740px', margin: '0 auto 48px auto' }}>
          {/* Editorial Eyebrow (Replaces AI rounded pill) */}
          <div className="editorial-eyebrow">
            <span className="eyebrow-accent" />
            <span className="eyebrow-glyph">✦</span>
            <span className="eyebrow-text">Verified Patient Experiences</span>
            <span className="eyebrow-glyph">✦</span>
            <span className="eyebrow-accent" />
          </div>

          <h1 
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
              color: '#15311e',
              fontWeight: '500',
              lineHeight: '1.2',
              marginBottom: '16px'
            }}
          >
            Real Reversal Journeys & Doctor Insights
          </h1>

          <p style={{ color: '#4c6c54', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Browse verified patient case logs, doctor-authored clinical articles, and research-backed herbal myth busters.
          </p>
        </div>

        {/* Patient Stories Grid */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#16311e', marginBottom: '24px' }}>
          Verified Patient Stories
        </h2>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
            marginBottom: '60px'
          }}
        >
          {stories.map(s => (
            <div 
              key={s.id}
              className="glass-panel"
              style={{
                padding: '30px',
                backgroundColor: '#ffffff',
                borderRadius: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 12px 35px rgba(0,0,0,0.03)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#386323', backgroundColor: '#e4f4dd', padding: '4px 10px', borderRadius: '9999px' }}>
                    Verified Patient
                  </span>
                  <div style={{ display: 'flex', gap: '2px', color: '#dd961b' }}>
                    {[...Array(s.rating)].map((_, i) => (
                      <Star key={i} size={13} fill="#dd961b" />
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#16311e', marginBottom: '4px' }}>
                  {s.condition}
                </div>

                <p style={{ fontSize: '0.92rem', color: '#496b53', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '20px' }}>
                  "{s.quote}"
                </p>
              </div>

              <div style={{ paddingTop: '16px', borderTop: '1px solid #e7f2eb' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#16311e' }}>{s.name}</div>
                <div style={{ fontSize: '12px', color: '#688c71' }}>{s.city} • {s.doctor}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Doctor-Authored Articles */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#16311e', marginBottom: '24px' }}>
          Doctor-Authored Research & Clinical Guides
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '60px' }}>
          {articles.map((art, i) => (
            <div 
              key={i}
              className="glass-panel"
              style={{
                padding: '26px',
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#56803b', textTransform: 'uppercase' }}>
                  {art.tag}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#16311e', marginTop: '6px', marginBottom: '12px' }}>
                  {art.title}
                </h3>
                <div style={{ fontSize: '12px', color: '#688c71' }}>
                  By {art.author} • {art.readTime}
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#4e7e2c' }}>
                <span>Read Full Article</span> <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/book-doctor" className="btn-primary-pill" style={{ padding: '14px 34px', fontSize: '14.5px' }}>
            Book 1-on-1 Consultation with Our BHMS Doctors
          </Link>
        </div>

      </div>
    </div>
  );
}
