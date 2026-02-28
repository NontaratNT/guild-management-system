import { ArrowRight, Skull, Swords, Shield, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="landing-page" style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Cinematic Hero Section */}
            <section style={{
                padding: '8rem 2rem',
                textAlign: 'center',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Effect Element */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '600px', height: '600px',
                    background: 'radial-gradient(circle, rgba(140, 42, 42, 0.4) 0%, transparent 60%)',
                    zIndex: -1, mixBlendMode: 'screen', filter: 'blur(40px)'
                }}></div>

                <div className="container" style={{ maxWidth: '850px', position: 'relative', zIndex: 1 }}>
                    <div className="animate-fade-up" style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
                        <span style={{
                            fontFamily: "'Cinzel', serif",
                            color: 'var(--primary)',
                            letterSpacing: '4px',
                            fontSize: '0.875rem',
                            textTransform: 'uppercase',
                            borderBottom: '1px solid var(--primary)',
                            paddingBottom: '4px'
                        }}>FOR YUKISAMA</span>
                    </div>

                    <h1 className="animate-fade-up text-gradient" style={{
                        fontSize: '4.5rem',
                        marginBottom: '1.5rem',
                        lineHeight: 1.1,
                        textShadow: '0 5px 15px rgba(0,0,0,0.8)'
                    }}>
                        สู่สมรภูมิแห่งตำนาน <br /> ยกระดับกิลด์สู่จุดสูงสุด
                    </h1>

                    <p className="animate-fade-up delay-100" style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-muted)',
                        marginBottom: '3.5rem',
                        lineHeight: 1.8,
                        maxWidth: '700px',
                        margin: '0 auto 3.5rem'
                    }}>
                        จารึกนามของสหายร่วมรบลงในระบบจัดการที่ทรงพลังที่สุด ผนึกกำลังจัดปาร์ตี้ลงดันเจี้ยน
                        ประกาศสงครามกิลด์วอร์ และปกป้องสมบัติของกองกลางดุจโล่แห่งโอดิน
                    </p>

                    <div className="animate-fade-up delay-200" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <Link to="/login" className="btn btn-primary" style={{ padding: '1.2rem 2.5rem', fontSize: '1.125rem' }}>
                            <Flame size={20} />
                            ปลุกพลังกิลด์ของคุณ
                            <ArrowRight size={20} />
                        </Link>
                        <button className="btn btn-secondary" style={{ padding: '1.2rem 2.5rem', fontSize: '1.125rem' }}>
                            <Shield size={20} />
                            อ่านศิลาจารึก (คู่มือ)
                        </button>
                    </div>
                </div>
            </section>

            {/* Epic Features Section */}
            <section style={{
                padding: '6rem 2rem',
                background: 'rgba(10, 11, 14, 0.8)',
                borderTop: '1px solid rgba(194, 147, 61, 0.1)',
                position: 'relative'
            }}>

                <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '2px', background: 'linear-gradient(to right, transparent, var(--primary), transparent)' }}></div>

                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 className="pulse-gold" style={{ fontSize: '2.5rem', color: 'var(--text-main)', display: 'inline-block' }}>
                            ศาสตร์แห่งการปกครองกิลด์
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
                        {features.map((feature, idx) => (
                            <div key={idx} className="glass-panel animate-fade-up" style={{
                                padding: '2.5rem',
                                animationDelay: `${idx * 150}ms`,
                                transition: 'transform 0.4s ease, box-shadow 0.4s ease'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.boxShadow = 'inset 0 0 30px rgba(10,10,10,0.9), 0 15px 40px rgba(0,0,0,0.9), 0 0 20px rgba(140, 42, 42, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'inset 0 0 20px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.9)';
                                }}
                            >
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(20,20,20,1), rgba(40,15,15,1))',
                                    width: '70px',
                                    height: '70px',
                                    borderRadius: '0',
                                    border: '1px solid var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '2rem',
                                    color: 'var(--primary)',
                                    transform: 'rotate(45deg)',
                                    margin: '0 auto 2rem'
                                }}>
                                    <div style={{ transform: 'rotate(-45deg)' }}>
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="text-gold" style={{ fontSize: '1.4rem', marginBottom: '1rem', textAlign: 'center' }}>{feature.title}</h3>
                                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, textAlign: 'center', fontSize: '1rem' }}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

const features = [
    {
        icon: <Skull size={34} />,
        title: "รายนามนักรบ",
        description: "คัดกรองและแบ่งยศถาบรรดาศักดิ์ของสหายร่วมรบ ติดตามการเข้าร่วมสมรภูมิ และจัดการสิทธิการสั่งการอย่างเด็ดขาด"
    },
    {
        icon: <Swords size={34} />,
        title: "ลั่นกลองรบ",
        description: "ตารางนัดหมายทำสงคราม (Guild War) และป่าวประกาศรวมพลตีบอส ดันเจี้ยนลับ พร้อมระบบนัดแนะที่แม่นยำดั่งคมดาบ"
    },
    {
        icon: <Shield size={34} />,
        title: "หีบสมบัติศักดิ์สิทธิ์",
        description: "คลังเก็บสรรพาวุธและทองคำของกิลด์ บันทึกรายรับ-รายจ่ายอย่างโปร่งใส ให้ทุกคนตรวจสอบเส้นทางแห่งความมั่งคั่งได้"
    }
];
