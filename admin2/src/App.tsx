import UserDiagnosis from './UserDiagnosis';

function App() {
  // 🌟 URL（/3 など）からIDを直接取得するシンプルな方法に変更
  const urlPath = window.location.pathname;
  const pathParts = urlPath.split('/');
  const lastPart = pathParts[pathParts.length - 1];
  
  // 数字であればそれをIDとし、そうでなければ0にする
  const diagnosisId = lastPart && !isNaN(Number(lastPart)) ? parseInt(lastPart, 10) : 0;

  return (
    <div className="App">
      {/* 🌟 BrowserRouterを必要とする部品（Routesなど）を一切使わないので、
           main.tsxでエラーが出ることもなくなります */}
      <UserDiagnosis diagnosisId={diagnosisId} />
    </div>
  );
}

export default App;