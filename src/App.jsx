import { useEffect, useState } from "react"
import { Moon, Book, PlayCircle, Search, ExternalLink } from "lucide-react"
import "./App.css"

function App() {
  const [searchWord, setSearchWord] = useState("keyboard")
  const [searchedData, setSearchedData] = useState(null)
  const [isError, setIsError] = useState(false)
  const [notFound, setNotFound] = useState("")

  const handleThemeToggle = () => {
    document.documentElement.classList.toggle("dark")
  }


  const handleFontChange = (e) => {
    document.body.style.fontFamily = e.target.value
  }
  useEffect(() => {
    getWord()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!searchWord.trim()) {
      setSearchedData(null)
      setIsError(true)
      return
    }
    setIsError(false)
    await getWord()
  }

  async function getWord() {
    const resp = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord}`)
    const data = await resp.json();

    if (resp.status === 404) {
      setNotFound(data.message)
      setSearchedData(null)
      return
    }

    let data2 = null
    data.forEach((el) => {
      const audio = el.phonetics.find((p) => p.audio)
      if (audio) data2 = { ...el, phonetics: audio }
    })

    setSearchedData(data2)
  }

  const handlePlaySound = () => {
    if (!searchedData?.phonetics?.audio) return
    const sound = new Audio(searchedData.phonetics.audio)
    sound.play()
  }

  return (
    <div className="wrapper">
      <header className="header">
        <Book className="icon" />
        <div className="font-select">
          <select onChange={handleFontChange}>
            <option value="sans-serif">Sans Serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Mono</option>
          </select>

          <div className="divider"></div>

          <label className="switch">
            <input type="checkbox" onChange={handleThemeToggle} />
            <span className="slider"></span>
          </label>

          <Moon className="moon" />
        </div>
      </header>

      <form className="search-form" onSubmit={handleSubmit}>
        <div className={`searchbox ${isError ? "error" : ""}`}>
          <input
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            placeholder="Search for any word…"
          />
          <Search size={20} className="search-icon" />
        </div>
        {isError && <p className="errmsg">Whoops, can't be empty…</p>}
      </form>

      {!searchedData ? (
        <div className="notfound-block">
          <span className="emoji">😕</span>
          <h2 className="emtitle">No Definitions Found</h2>
          <p className="desc">
            Sorry pal, we couldn't find definitions for the word you were looking for.
            You can try the search again at a later time or head to the web instead.
          </p>
        </div>
      ) :
        (<div className="content">
          <div className="word-row">
            <div>
              <h1 className="word">{searchedData.word}</h1>
              <h2 className="phonetic">{searchedData.phonetic}</h2>
            </div>

            <button className="play wave" onClick={handlePlaySound}>
              <span className="pulse"></span>
              <PlayCircle size={38} color="white" strokeWidth={2} />
            </button>
          </div>

          {searchedData.meanings.map((el) => (
            <div key={el.partOfSpeech} className="meaning">
              <div className="part">
                <h3>{el.partOfSpeech}</h3>
                <div className="line"></div>
              </div>

              <p className="meaning-title">Meaning</p>
              <ul>
                {el.definitions.map((d) => (
                  <li key={d.definition}>{d.definition}</li>
                ))}
              </ul>

              {el.synonyms.length > 0 && (
                <p className="syn">
                  Synonyms: <span>{el.synonyms.join(", ")}</span>
                </p>
              )}
            </div>
          ))}

          <p className="source">
            Source:{" "}
            <a href={searchedData.sourceUrls[0]} target="_blank">
              {searchedData.sourceUrls[0]}
              <ExternalLink size={14} className="exticon" />
            </a>
          </p>
        </div>
        )}
    </div>
  )
}

export default App;
