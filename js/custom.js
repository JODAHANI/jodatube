function init() {
  $('.slide').slick({
    isFinite: true,
    slidesToShow: 3,
    slidesToScroll: 3,
    autoplay: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });

  
  // 스크롤 이벤트.
  document.addEventListener('scroll', () => {
    let scrollSize = document.documentElement.scrollTop
    if (scrollSize > 200) {
      $('header').addClass('on')
    } else {
      $('header').removeClass('on')
    }
  })

  // 트리거 토글버튼
  $('.trigger').on('click', function() {
    $(this).toggleClass('on')
    $('.gnb').toggleClass('on')
  })

  $('.gnb li a').on('click', () => {
    $('.trigger').removeClass('on')
    $('.gnb').removeClass('on')
  });


}


init()

