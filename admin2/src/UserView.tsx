import { useParams } from 'react-router-dom';
import DiagnosisPlayer from './DiagnosisPlayer';

export default function UserView() {
  const { id } = useParams();
  
  return (
    <div style={{ 
      background: 'linear-gradient(180deg, #fff5f5 0%, #fff 100%)', 
      minHeight: '100dvh', // スマホのメニューバーを考慮した高さ
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '16px', // スマホの両端に少し余白
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '450px', // スマホでちょうど良い横幅
        margin: '0 auto'
      }}>
        <DiagnosisPlayer />
      </div>
    </div>
  );
}