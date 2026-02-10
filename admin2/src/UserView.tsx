import { useParams } from 'react-router-dom';
import DiagnosisPlayer from './DiagnosisPlayer'; // 新しい部品を読み込む

export default function UserView() {
  const { id } = useParams();
  
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #fdf8f8 0%, #f4ece1 100%)', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '500px', animation: 'fadeIn 1s ease-out' }}>
        {id ? (
          /* ここが重要！必ず DiagnosisPlayer になっている必要があります */
          <DiagnosisPlayer />
        ) : (
          <p style={{ textAlign: 'center', color: '#999' }}>診断が見つかりません</p>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}