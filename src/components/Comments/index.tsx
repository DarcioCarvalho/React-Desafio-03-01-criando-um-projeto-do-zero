interface CommentsProps {
  className: string;
}

export default function Comments({ className }: CommentsProps) {
  return (

    <section className={className}
      ref={elem => {

        if (!elem) {
          return;
        }

        const scriptElem = document.createElement('script');
        scriptElem.src = "https://utteranc.es/client.js"
        scriptElem.async = true
        scriptElem.crossOrigin = "anonymous"
        scriptElem.setAttribute("repo", process.env.NEXT_PUBLIC_UTTERANC_REPO)
        scriptElem.setAttribute("issue-term", "pathname")
        scriptElem.setAttribute("theme", "github-dark")

        const elements = elem.getElementsByClassName('utterances')
        if (elements.length >= 1) {
          elements[0].parentNode.replaceChild(scriptElem, elements[0])
        } else {
          elem.appendChild(scriptElem)
        }

      }}
    />

  )
}