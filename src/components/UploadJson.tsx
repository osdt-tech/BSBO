// // src/components/UploadJson.tsx
// import { useState } from 'react'
// import { initKvStore } from '../data/initKvStore'

// export default function UploadJson() {
//   const [jsonText, setJsonText] = useState('')
//   const [status, setStatus] = useState('')

//   const handleImport = async () => {
//     try {
//       const data = JSON.parse(jsonText)
//       setStatus('⏳ Import läuft...')
//       await initKvStore(undefined, data) // siehe kleine Anpassung in initKvStore unten
//       setStatus('✅ Import erfolgreich!')
//     } catch (err) {
//       console.error(err)
//       setStatus('❌ Fehler: Ungültiges JSON oder Importproblem')
//     }
//   }

//   return (
//     <div>
//       <h2>Aufgaben-JSON einfügen</h2>
//       <textarea
//         rows={10}
//         cols={80}
//         value={jsonText}
//         onChange={(e) => setJsonText(e.target.value)}
//         placeholder="Füge hier dein JSON ein..."
//       />
//       <br />
//       <button onClick={handleImport}>Import starten</button>
//       <p>{status}</p>
//     </div>
//   )
// }
