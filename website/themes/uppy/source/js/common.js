(function () {
  var each = [].forEach
  var doc = document.documentElement
  var body = document.body

  var isIndex = body.classList.contains('page-index')

  // On index page
  if (isIndex) {
    IndexPage()
  // On inner pages
  } else {
    InnerPage()
  }

  function InnerPage () {
    // var main = document.querySelector('.js-MainContent')
    var menuButton = document.querySelector('.js-MenuBtn')
    var header = document.querySelector('.js-MainHeader')
    var menu = document.querySelector('.js-Sidebar')
    var content = document.querySelector('.js-Content')
    var transloaditBar = document.querySelector('.js-TransloaditBar')

    var animating = false
    var allLinks = []

    // // listen for scroll event to do positioning & highlights
    // window.addEventListener('scroll', updateSidebar)
    // window.addEventListener('resize', updateSidebar)

    function makeSidebarTop () {
      var headerHeight = header.offsetHeight
      var transloaditBarHeight = 0

      if (transloaditBar) {
        transloaditBarHeight = transloaditBar.offsetHeight
      }

      if (window.matchMedia('(min-width: 1024px)').matches) {
        var headerTopOffset = header.getBoundingClientRect().top
        menu.style.top = `${headerHeight + headerTopOffset}px`
      } else {
        menu.style.paddingTop = `${headerHeight + transloaditBarHeight + 20}px`
      }
    }

    makeSidebarTop()

    window.addEventListener('scroll', makeSidebarTop)
    window.addEventListener('resize', makeSidebarTop)

    function updateSidebar () {
      var top = (doc && doc.scrollTop) || body.scrollTop
      var headerHeight = header.offsetHeight
      if (top > (headerHeight - 25)) {
        // main.classList.add('fix-sidebar')
        header.classList.add('fix-header')
      } else {
        // main.classList.remove('fix-sidebar')
        header.classList.remove('fix-header')
      }
      if (animating || !allLinks) return
      var last
      for (var i = 0; i < allLinks.length; i++) {
        var link = allLinks[i]
        if (link.offsetTop > top) {
          if (!last) last = link
          break
        } else {
          last = link
        }
      }
      if (last) {
        setActive(last.id)
      }
    }

    function makeLink (h) {
      var link = document.createElement('li')
      var text = h.textContent.replace(/\(.*\)$/, '')
      // make sure the ids are link-able...
      h.id = h.id
        .replace(/\(.*\)$/, '')
        .replace(/\$/, '')
      link.innerHTML
        = `<a class="section-link" data-scroll href="#${h.id}">${
          text
        }</a>`
      return link
    }

    function collectH3s (h) {
      var h3s = []
      var next = h.nextSibling
      while (next && next.tagName !== 'H2') {
        if (next.tagName === 'H3') {
          h3s.push(next)
        }
        next = next.nextSibling
      }
      return h3s
    }

    function makeSubLinks (h3s, small) {
      var container = document.createElement('ul')
      if (small) {
        container.className = 'menu-sub'
      }
      h3s.forEach((h) => {
        container.appendChild(makeLink(h))
      })
      return container
    }

    function setActive (id) {
      var previousActive = menu.querySelector('.section-link.active')
      var currentActive = typeof id === 'string'
        ? menu.querySelector(`.section-link[href="#${id}"]`)
        : id
      if (currentActive !== previousActive) {
        if (previousActive) previousActive.classList.remove('active')
        currentActive.classList.add('active')
      }
    }

    function makeLinkClickable (link) {
      if (link.getAttribute('data-scroll') === 'no') {
        return
      }
      var wrapper = document.createElement('a')
      wrapper.href = `#${link.id}`
      wrapper.setAttribute('data-scroll', '')
      link.parentNode.insertBefore(wrapper, link)
      wrapper.appendChild(link)
    }

    menuButton.addEventListener('click', () => {
      menu.classList.toggle('is-open')
    })

    body.addEventListener('click', (e) => {
      if (e.target !== menuButton && !menu.contains(e.target)) {
        menu.classList.remove('is-open')
      }
    })

    function initSubHeaders () {
      // build sidebar
      var currentPageAnchor = menu.querySelector('.sidebar-link.current')
      var isDocs = content.classList.contains('docs')

      if (!isDocs) return

      if (currentPageAnchor) {
        var sectionContainer

        // if (false && isAPI) {
        //   sectionContainer = document.querySelector('.menu-root')
        // } else {
        //   sectionContainer = document.createElement('ul')
        //   sectionContainer.className = 'menu-sub'
        //   currentPageAnchor.parentNode.appendChild(sectionContainer)
        // }

        sectionContainer = document.createElement('ul')
        sectionContainer.className = 'menu-sub'
        currentPageAnchor.parentNode.appendChild(sectionContainer)

        var h2s = content.querySelectorAll('h2')

        if (h2s.length) {
          each.call(h2s, (h) => {
            sectionContainer.appendChild(makeLink(h))
            var h3s = collectH3s(h)
            allLinks.push(h)
            allLinks.push.apply(allLinks, h3s)
            if (h3s.length) {
              sectionContainer.appendChild(makeSubLinks(h3s, isDocs))
            }
          })
        } else {
          var h3s = content.querySelectorAll('h3')
          each.call(h3s, (h) => {
            sectionContainer.appendChild(makeLink(h))
            allLinks.push(h)
          })
        }

        sectionContainer.addEventListener('click', (e) => {
          e.preventDefault()
          if (e.target.classList.contains('section-link')) {
            menu.classList.remove('open')
            setActive(e.target)
            animating = true
            setTimeout(() => {
              animating = false
            }, 400)
          }
        }, true)

        // make links clickable
        allLinks.forEach(makeLinkClickable)

        // init smooth scroll
        window.smoothScroll.init({
          speed: 400,
          // offset: window.innerWidth > 720
          //   ? 40
          //   : 58
        })
      }

      // listen for scroll event to do positioning & highlights
      window.addEventListener('scroll', updateSidebar)
      window.addEventListener('resize', updateSidebar)
    }

    var isBlog = menu.classList.contains('is-blog')
    if (!isBlog) {
      initSubHeaders()
    }
  }

  function IndexPage () {
    // Tabs
    window.addEventListener('load', () => {
      var tabs = document.querySelectorAll('.Tabs-link')

      function myTabClicks (tabClickEvent) {
        for (var i = 0; i < tabs.length; i++) {
          tabs[i].classList.remove('Tabs-link--active')
        }

        var clickedTab = tabClickEvent.currentTarget
        clickedTab.classList.add('Tabs-link--active')
        tabClickEvent.preventDefault()
        tabClickEvent.stopPropagation()

        var myContentPanes = document.querySelectorAll('.TabPane')

        for (i = 0; i < myContentPanes.length; i++) {
          myContentPanes[i].classList.remove('TabPane--active')
        }

        // storing reference to event.currentTarget, otherwise we get
        // all the children like SVGs, instead of our target — the link element
        var anchorReference = tabClickEvent.currentTarget
        var activePaneId = anchorReference.getAttribute('href')
        var activePane = document.querySelector(activePaneId)
        activePane.classList.add('TabPane--active')
      }

      for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', myTabClicks)
      }
    })

    var tagline = document.querySelector('.MainHeader-tagline')
    var taglinePart = document.querySelector('.MainHeader-taglinePart')
    var taglineList = document.querySelector('.MainHeader-taglineList')
    var taglineCounter = taglineList.children.length

    function shuffleTaglines () {
      for (var i = taglineList.children.length; i >= 0; i--) {
        taglineList.appendChild(taglineList.children[Math.random() * i | 0])
      }
    }

    function loopTaglines () {
      taglineCounter--
      if (taglineCounter >= 0) {
        var taglineText = taglineList.children[taglineCounter].textContent
        showTagline(taglineText)
        return
      }
      taglineCounter = taglineList.children.length
      loopTaglines()
    }

    function showTagline (taglineText) {
      tagline.classList.remove('is-visible')
      setTimeout(() => {
        taglinePart.innerHTML = taglineText
        tagline.classList.add('is-visible')
      }, 800)
    }

    shuffleTaglines()
    loopTaglines()
    setInterval(loopTaglines, 4000)
  }

  // Search with SwiftType
  // @todo get our own swifttype

  // (function(w,d,t,u,n,s,e){w['SwiftypeObject']=n;w[n]=w[n]||function(){
  // (w[n].q=w[n].q||[]).push(arguments);};s=d.createElement(t);
  // e=d.getElementsByTagName(t)[0];s.async=1;s.src=u;e.parentNode.insertBefore(s,e);
  // })(window,document,'script','//s.swiftypecdn.com/install/v2/st.js','_st');

  // _st('install','HgpxvBc7pUaPUWmG9sgv','2.0.0');

  // version select
  // document.querySelector('.version-select').addEventListener('change', function (e) {
  //   var version = e.target.value
  //   if (version.indexOf('1.') !== 0) {
  //     version = version.replace('.', '')
  //     var section = window.location.pathname.match(/\/(\w+?)\//)[1]
  //     window.location.assign('http://' + version + '.uppy.io/' + section + '/')
  //   } else {
  //     // TODO when 1.x is out
  //   }
  // })
}())
