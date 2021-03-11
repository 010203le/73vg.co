// add custome theme and darkmode
if (UI.dark_mode) {
  document.write(`<style>* {box-sizing: border-box}body{color:rgba(255,255,255,.87);background-color:#333232}.mdui-theme-primary-${UI.main_color} .mdui-color-theme{background-color:#232427!important}</style>`);
}

// 初始化页面，并载入必要资源
function init() {
  document.siteName = $('title').html();
  $('body').addClass(`mdui-theme-primary-${UI.main_color} mdui-theme-accent-${UI.accent_color}`);
  var html = `
<header class="nexmoe-nav">
	<div class="navSize">
			<a href="/"><img class="avatar" src="https://cdn.jsdelivr.net/gh/010203le/73vg.co/titlev2.png"/></a>
			<div class="nav_menu">
				<ul class="menu_ul">
					<li class="menu_li"><a href="https://discord.gg/jfYqMXAySN" target="_blank">DISCORD</a></li>
				</ul>
				<div class="nav_icon" ></div>
			</div>
	</div>
</header>
<div class="mdui-container">
	<div class="mdui-container-fluid">
		<div id="nav" class="mdui-toolbar nexmoe-item nav-style"> </div>
    </div>
	<div class="mdui-container-fluid">
		<div id="head_md" class="mdui-typo nexmoe-item" style="display:none;padding: 20px 0;"></div>
		<div id="content" class="nexmoe-item"></div>
	 	<div id="readme_md" class="mdui-typo nexmoe-item" style="display:none; padding: 20px 0;"></div>
	</div>
</div>
	`;
  $('body').html(html);
}

const Os = {
  isWindows: navigator.platform.toUpperCase().indexOf('WIN') > -1, // .includes
  isMac: navigator.platform.toUpperCase().indexOf('MAC') > -1,
  isMacLike: /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform),
  isIos: /(iPhone|iPod|iPad)/i.test(navigator.platform),
  isMobile: /Android|webOS|iPhone|iPad|iPod|iOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
};

function getDocumentHeight() {
  var D = document;
  return Math.max(
    D.body.scrollHeight, D.documentElement.scrollHeight,
    D.body.offsetHeight, D.documentElement.offsetHeight,
    D.body.clientHeight, D.documentElement.clientHeight
  );
}

function render(path) {
  if (path.indexOf("?") > 0) {
    path = path.substr(0, path.indexOf("?"));
  }
  title(path);
  nav(path);
  // .../0: 这种
  var reg = /\/\d+:$/g;
  if (window.MODEL.is_search_page) {
    // 用来存储一些滚动事件的状态
    window.scroll_status = {
      // 滚动事件是否已经绑定
      event_bound: false,
      // "滚动到底部，正在加载更多数据" 事件的锁
      loading_lock: false
    };
    render_search_result_list()
  } else if (path.match(reg) || path.substr(-1) == '/') {
    // 用来存储一些滚动事件的状态
    window.scroll_status = {
      // 滚动事件是否已经绑定
      event_bound: false,
      // "滚动到底部，正在加载更多数据" 事件的锁
      loading_lock: false
    };
    list(path);
  } else {
    file(path);
  }
}


// 渲染 title
function title(path) {
  path = decodeURI(path);
  var cur = window.current_drive_order || 0;
  var drive_name = window.drive_names[cur];
  path = path.replace(`/${cur}:`, '');
  // $('title').html(document.siteName + ' - ' + path);
  var model = window.MODEL;
  if (model.is_search_page)
    $('title').html(`${document.siteName} - ${drive_name} - 搜索 ${model.q} 的结果`);
  else
    $('title').html(`${document.siteName} - ${drive_name} - ${path}`);
}

// 渲染搜索栏
function nav(path) {
  var model = window.MODEL;
  var html = "";
  var cur = window.current_drive_order || 0;

  // html += `<a href="/${cur}:/" class="mdui-typo-headline folder">${document.siteName}</a>`;

  var names = window.drive_names;
  /*html += `<button class="mdui-btn mdui-btn-raised" mdui-menu="{target: '#drive-names'}"><i class="mdui-icon mdui-icon-left material-icons">share</i> ${names[cur]}</button>`;
  html += `<ul class="mdui-menu" id="drive-names" style="transform-origin: 0px 0px; position: fixed;">`;
  names.forEach((name, idx) => {
      html += `<li class="mdui-menu-item ${(idx === cur) ? 'mdui-list-item-active' : ''} "><a href="/${idx}:/" class="mdui-ripple">${name}</a></li>`;
  });
  html += `</ul>`;*/

  // 修改为 select
  html += `<select class="mdui-select" onchange="window.location.href=this.value" mdui-select style="overflow:visible;">`;
  names.forEach((name, idx) => {
    html += `<option value="/${idx}:/"  ${idx === cur ? 'selected="selected"' : ''} >${name}</option>`;
  });
  html += `</select>`;

  html += `<a href="/${cur}:/" class="mdui-typo-headline folder">${document.siteName}</a>`;
  if (!model.is_search_page) {
    var arr = path.trim('/').split('/');
    var p = '/';
    if (arr.length > 1) {
      arr.shift();
      for (i in arr) {
        var n = arr[i];
        n = decodeURI(n);
        p += n + '/';
        if (n == '') {
          break;
        }
        html += `<i class="mdui-icon material-icons mdui-icon-dark folder" style="margin:0;">chevron_right</i><a class="folder" href="/${cur}:${p}">${n}</a>`;
      }
    }
  }

  var search_text = model.is_search_page ? (model.q || '') : '';
  const isMobile = Os.isMobile;
  var search_bar = `<div class="mdui-toolbar-spacer"></div>
        <div id="search_bar" class="mdui-textfield mdui-textfield-expandable mdui-float-right mdui-textfield-expanded" style="max-width:${isMobile ? 300 : 400}px">
            <button class="mdui-textfield-icon mdui-btn mdui-btn-icon" onclick="if($('#search_bar').hasClass('mdui-textfield-expanded') && $('#search_bar_form>input').val()) $('#search_bar_form').submit();">
                <i class="mdui-icon material-icons">search</i>
            </button>
            <form id="search_bar_form" method="get" action="/${cur}:search">
            <input class="mdui-textfield-input" type="text" name="q" autocomplete ="off" placeholder="搜尋" value="${search_text}"/>
            </form>
        </div>`;

  // 个人盘 或 团队盘
  if (model.root_type < 2) {
    // 显示搜索框
    html += search_bar;
  }

  $('#nav').html(html);
  mdui.mutation();
  mdui.updateTextFields();
}

/**
 * 发起列目录的 POST 请求
 * @param path Path
 * @param params Form params
 * @param resultCallback Success Result Callback
 * @param authErrorCallback Pass Error Callback
 */
function requestListPath(path, params, resultCallback, authErrorCallback) {
  var p = {
    password: params['password'] || null,
    page_token: params['page_token'] || null,
    page_index: params['page_index'] || 0
  };
  $.post(path, p, function (data, status) {
    var res = jQuery.parseJSON(data);
    if (res && res.error && res.error.code == '401') {
      // 密码验证失败
      if (authErrorCallback) authErrorCallback(path)
    } else if (res && res.data) {
      if (resultCallback) resultCallback(res, path, p)
    }
  })
}

/**
 * 搜索 POST 请求
 * @param params Form params
 * @param resultCallback Success callback
 */
function requestSearch(params, resultCallback) {
  var p = {
    q: params['q'] || null,
    page_token: params['page_token'] || null,
    page_index: params['page_index'] || 0
  };
  $.post(`/${window.current_drive_order}:search`, p, function (data, status) {
    var res = jQuery.parseJSON(data);
    if (res && res.data) {
      if (resultCallback) resultCallback(res, p)
    }
  })
}


// 渲染文件列表
function list(path) {
  var content = `
	 <div class="mdui-row"> 
	  <ul class="mdui-list"> 
	   <li class="mdui-list-item th"> 
	    <div class="mdui-col-xs-12 mdui-col-sm-7">
	     檔案名稱
	<i class="mdui-icon material-icons icon-sort" data-sort="name" data-order="more">expand_more</i>
	    </div> 
	    <div class="mdui-col-sm-3 mdui-text-right">
	     修改時間
	<i class="mdui-icon material-icons icon-sort" data-sort="date" data-order="downward">expand_more</i>
	    </div> 
	    <div class="mdui-col-sm-2 mdui-text-right">
	     檔案大小
	<i class="mdui-icon material-icons icon-sort" data-sort="size" data-order="downward">expand_more</i>
	    </div> 
	    </li> 
	  </ul> 
	 </div> 
	 <div class="mdui-row"> 
	  <ul id="list" class="mdui-list"> 
	  </ul> 
	  <div id="count" class="mdui-hidden mdui-center mdui-text-center mdui-m-b-3 mdui-typo-subheading mdui-text-color-blue-grey-500">共 <span class="number"></span> 項</div>
	 </div>
	`;
  $('#content').html(content);

  var password = localStorage.getItem('password' + path);
  $('#list').html(`<div class="mdui-progress"><div class="mdui-progress-indeterminate"></div></div>`);
  $('#readme_md').hide().html('');
  $('#head_md').hide().html('');

  /**
   * 列目录请求成功返回数据后的回调
   * @param res 返回的结果(object)
   * @param path 请求的路径
   * @param prevReqParams 请求时所用的参数
   */
  function successResultCallback(res, path, prevReqParams) {

    // 把 nextPageToken 和 currentPageIndex 暂存在 list元素 中
    $('#list')
      .data('nextPageToken', res['nextPageToken'])
      .data('curPageIndex', res['curPageIndex']);

    // 移除 loading spinner
    $('#spinner').remove();

    if (res['nextPageToken'] === null) {
      // 如果是最后一页，取消绑定 scroll 事件，重置 scroll_status ，并 append 数据
      $(window).off('scroll');
      window.scroll_status.event_bound = false;
      window.scroll_status.loading_lock = false;
      append_files_to_list(path, res['data']['files']);
    } else {
      // 如果不是最后一页，append数据 ，并绑定 scroll 事件（如果还未绑定），更新 scroll_status
      append_files_to_list(path, res['data']['files']);
      if (window.scroll_status.event_bound !== true) {
        // 绑定事件，如果还未绑定
        $(window).on('scroll', function () {
          var scrollTop = $(this).scrollTop();
          var scrollHeight = getDocumentHeight();
          var windowHeight = $(this).height();
          // 滚到底部
          if (scrollTop + windowHeight > scrollHeight - (Os.isMobile ? 130 : 80)) {
            /*
                滚到底部事件触发时，如果此时已经正在 loading 中，则忽略此次事件；
                否则，去 loading，并占据 loading锁，表明 正在 loading 中
             */
            if (window.scroll_status.loading_lock === true) {
              return;
            }
            window.scroll_status.loading_lock = true;

            // 展示一个 loading spinner
            $(`<div id="spinner" class="mdui-spinner mdui-spinner-colorful mdui-center"></div>`)
              .insertBefore('#readme_md');
            mdui.updateSpinners();
            // mdui.mutation();

            let $list = $('#list');
            requestListPath(path, {
                password: prevReqParams['password'],
                page_token: $list.data('nextPageToken'),
                // 请求下一页
                page_index: $list.data('curPageIndex') + 1
              },
              successResultCallback,
              // 密码和之前相同。不会出现 authError
              null
            )
          }
        });
        window.scroll_status.event_bound = true
      }
    }

    // loading 成功，并成功渲染了新数据之后，释放 loading 锁，以便能继续处理 "滚动到底部" 事件
    if (window.scroll_status.loading_lock === true) {
      window.scroll_status.loading_lock = false
    }
  }

  // 开始从第1页请求数据
  requestListPath(path, {password: password},
    successResultCallback,
    function (path) {
      $('#spinner').remove();
      var pass = prompt("目錄加密, 請輸入密碼", "");
      localStorage.setItem('password' + path, pass);
      if (pass != null && pass != "") {
        list(path);
      } else {
        history.go(-1);
      }
    });
}

/**
 * 把请求得来的新一页的数据追加到 list 中
 * @param path 路径
 * @param files 请求得来的结果
 */
function append_files_to_list(path, files) {
  var $list = $('#list');
  // 是最后一页数据了吗？
  var is_lastpage_loaded = null === $list.data('nextPageToken');
  var is_firstpage = '0' == $list.data('curPageIndex');

  html = "";
  let targetFiles = [];
  for (i in files) {
    var item = files[i];
    var p = path+encodeURIComponent(item.name) + '/';
    if (item['size'] == undefined) {
      item['size'] = "";
    }

    item['modifiedTime'] = utc2beijing(item['modifiedTime']);
    item['size'] = formatFileSize(item['size']);
    if (item['mimeType'] == 'application/vnd.google-apps.folder') {
      html += `<li class="mdui-list-item mdui-ripple"><a href="${p}" class="folder">
	            <div class="mdui-col-xs-12 mdui-col-sm-7 mdui-text-truncate" title="${item.name}">
	            <i class="mdui-icon material-icons">folder_open</i>
	              ${item.name}
	            </div>
	            <div class="mdui-col-sm-3 mdui-text-right">${item['modifiedTime']}</div>
	            <div class="mdui-col-sm-2 mdui-text-right">${item['size']}</div>
	            </a>
	        </li>`;
    } else {
      var p = path+encodeURIComponent(item.name);
      const filepath = path+encodeURIComponent(item.name);
      var c = "file";

      // 渲染head.md
			get_file('/0:/HEAD.md', item, (data) => {
				markdown('#head_md', data)
			})

      // 当加载完最后一页后，才显示 README ，否则会影响滚动事件 + 隱藏項目
      if (is_lastpage_loaded && item.name == "README.md") {
        get_file(p, item, function (data) {
          markdown("#readme_md", data);
        });
        continue
      }
      if (item.name == "HEAD.md") {
        // get_file(p, item, function (data) {
        //   markdown("#head_md", data);
        // });
        continue
      }
      var ext = p.split('.').pop().toLowerCase();
      html += `<li class="mdui-list-item file mdui-ripple" target="_blank"><a gd-type="${item.mimeType}" href="${p}" class="${c}">
	          <div class="mdui-col-xs-12 mdui-col-sm-7 mdui-text-truncate" title="${item.name}">
	          <i class="mdui-icon material-icons">insert_drive_file</i>
	            ${item.name}
	          </div>
	          <div class="mdui-col-sm-3 mdui-text-right">${item['modifiedTime']}</div>
	          <div class="mdui-col-sm-2 mdui-text-right">${item['size']}</div>
	          </a>
	      </li>`;
    }
  }

  if (targetFiles.length > 0) {
    let old = localStorage.getItem(path);
    let new_children = targetFiles;
    // 第1页重设；否则追加
    if (!is_firstpage && old) {
      let old_children;
      try {
        old_children = JSON.parse(old);
        if (!Array.isArray(old_children)) {
          old_children = []
        }
      } catch (e) {
        old_children = [];
      }
      new_children = old_children.concat(targetFiles)
    }

    localStorage.setItem(path, JSON.stringify(new_children))
  }

  // 是第1页时，去除横向loading条
  $list.html(($list.data('curPageIndex') == '0' ? '' : $list.html()) + html);
  // 是最后一页时，统计并显示出总项目数
  if (is_lastpage_loaded) {
    $('#count').removeClass('mdui-hidden').find('.number').text($list.find('li.mdui-list-item').length);
  }
}

/**
 * 渲染搜索结果列表。有大量重复代码，但是里面有不一样的逻辑，暂时先这样分开弄吧
 */
function render_search_result_list() {
  var content = `
	<div id="head_md" class="mdui-typo" style="display:none;padding: 20px 0;"></div>

	 <div class="mdui-row"> 
	  <ul class="mdui-list"> 
	   <li class="mdui-list-item th"> 
	    <div class="mdui-col-xs-12 mdui-col-sm-7">
	     名稱
	<i class="mdui-icon material-icons icon-sort" data-sort="name" data-order="more">expand_more</i>
	    </div> 
	    <div class="mdui-col-sm-3 mdui-text-right">
	     修改時間
	<i class="mdui-icon material-icons icon-sort" data-sort="date" data-order="downward">expand_more</i>
	    </div> 
	    <div class="mdui-col-sm-2 mdui-text-right">
	     檔案大小
	<i class="mdui-icon material-icons icon-sort" data-sort="size" data-order="downward">expand_more</i>
	    </div> 
	    </li> 
	  </ul> 
	 </div> 
	 <div class="mdui-row"> 
	  <ul id="list" class="mdui-list"> 
	  </ul> 
	  <div id="count" class="mdui-hidden mdui-center mdui-text-center mdui-m-b-3 mdui-typo-subheading mdui-text-color-blue-grey-500">共 <span class="number"></span> 項</div>
	 </div>
	 <div id="readme_md" class="mdui-typo" style="display:none; padding: 20px 0;"></div>
	`;
  $('#content').html(content);

  $('#list').html(`<div class="mdui-progress"><div class="mdui-progress-indeterminate"></div></div>`);
  $('#readme_md').hide().html('');
  $('#head_md').hide().html('');

  /**
   * 搜索请求成功返回数据后的回调
   * @param res 返回的结果(object)
   * @param path 请求的路径
   * @param prevReqParams 请求时所用的参数
   */
  function searchSuccessCallback(res, prevReqParams) {

    // 把 nextPageToken 和 currentPageIndex 暂存在 list元素 中
    $('#list')
      .data('nextPageToken', res['nextPageToken'])
      .data('curPageIndex', res['curPageIndex']);

    // 移除 loading spinner
    $('#spinner').remove();

    if (res['nextPageToken'] === null) {
      // 如果是最后一页，取消绑定 scroll 事件，重置 scroll_status ，并 append 数据
      $(window).off('scroll');
      window.scroll_status.event_bound = false;
      window.scroll_status.loading_lock = false;
      append_search_result_to_list(res['data']['files']);
    } else {
      // 如果不是最后一页，append数据 ，并绑定 scroll 事件（如果还未绑定），更新 scroll_status
      append_search_result_to_list(res['data']['files']);
      if (window.scroll_status.event_bound !== true) {
        // 绑定事件，如果还未绑定
        $(window).on('scroll', function () {
          var scrollTop = $(this).scrollTop();
          var scrollHeight = getDocumentHeight();
          var windowHeight = $(this).height();
          // 滚到底部
          if (scrollTop + windowHeight > scrollHeight - (Os.isMobile ? 130 : 80)) {
            /*
                滚到底部事件触发时，如果此时已经正在 loading 中，则忽略此次事件；
                否则，去 loading，并占据 loading锁，表明 正在 loading 中
             */
            if (window.scroll_status.loading_lock === true) {
              return;
            }
            window.scroll_status.loading_lock = true;

            // 展示一个 loading spinner
            $(`<div id="spinner" class="mdui-spinner mdui-spinner-colorful mdui-center"></div>`)
              .insertBefore('#readme_md');
            mdui.updateSpinners();
            // mdui.mutation();

            let $list = $('#list');
            requestSearch({
                q: window.MODEL.q,
                page_token: $list.data('nextPageToken'),
                // 请求下一页
                page_index: $list.data('curPageIndex') + 1
              },
              searchSuccessCallback
            )
          }
        });
        window.scroll_status.event_bound = true
      }
    }

    // loading 成功，并成功渲染了新数据之后，释放 loading 锁，以便能继续处理 "滚动到底部" 事件
    if (window.scroll_status.loading_lock === true) {
      window.scroll_status.loading_lock = false
    }
  }

  // 开始从第1页请求数据
  requestSearch({q: window.MODEL.q}, searchSuccessCallback);
}

/**
 * 追加新一页的搜索结果
 * @param files
 */
function append_search_result_to_list(files) {
  var $list = $('#list');
  // 是最后一页数据了吗？
  var is_lastpage_loaded = null === $list.data('nextPageToken');
  // var is_firstpage = '0' == $list.data('curPageIndex');

  html = "";

  for (i in files) {
    var item = files[i];
    if (item['size'] == undefined) {
      item['size'] = "";
    }

    item['modifiedTime'] = utc2beijing(item['modifiedTime']);
    item['size'] = formatFileSize(item['size']);
    if (item['mimeType'] == 'application/vnd.google-apps.folder') {
      html += `<li class="mdui-list-item mdui-ripple"><a id="${item['id']}" onclick="onSearchResultItemClick(this)" class="folder">
	            <div class="mdui-col-xs-12 mdui-col-sm-7 mdui-text-truncate" title="${item.name}">
	            <i class="mdui-icon material-icons">folder_open</i>
	              ${item.name}
	            </div>
	            <div class="mdui-col-sm-3 mdui-text-right">${item['modifiedTime']}</div>
	            <div class="mdui-col-sm-2 mdui-text-right">${item['size']}</div>
	            </a>
	        </li>`;
    } else {
      switch(item.name) { // 隱藏項目
				case 'README.md':
					continue
				case 'HEAD.md':
					continue
			}

      var c = "file";
      var ext = item.name.split('.').pop().toLowerCase();
      html += `<li class="mdui-list-item file mdui-ripple" target="_blank"><a id="${item['id']}" gd-type="${item.mimeType}" onclick="onSearchResultItemClick(this)" class="${c}">
	          <div class="mdui-col-xs-12 mdui-col-sm-7 mdui-text-truncate" title="${item.name}">
	          <i class="mdui-icon material-icons">insert_drive_file</i>
	            ${item.name}
	          </div>
	          <div class="mdui-col-sm-3 mdui-text-right">${item['modifiedTime']}</div>
	          <div class="mdui-col-sm-2 mdui-text-right">${item['size']}</div>
	          </a>
	      </li>`;
    }
  }

  // 是第1页时，去除横向loading条
  $list.html(($list.data('curPageIndex') == '0' ? '' : $list.html()) + html);
  // 是最后一页时，统计并显示出总项目数
  if (is_lastpage_loaded) {
    $('#count').removeClass('mdui-hidden').find('.number').text($list.find('li.mdui-list-item').length);
  }
}

/**
 * 搜索结果项目点击事件
 * @param a_ele 点击的元素
 */
function onSearchResultItemClick(a_ele) {
  var me = $(a_ele);
  var can_preview = me.hasClass('view');
  var cur = window.current_drive_order;
  var dialog = mdui.dialog({
    title: '',
    content: '<div class="mdui-text-center mdui-typo-title mdui-m-b-1">正在讀取目標路徑...</div><div class="mdui-spinner mdui-spinner-colorful mdui-center"></div>',
    // content: '<div class="mdui-spinner mdui-spinner-colorful mdui-center"></div>',
    history: false,
    modal: true,
    closeOnEsc: true
  });
  mdui.updateSpinners();

  // 请求获取路径
  $.post(`/${cur}:id2path`, {id: a_ele.id}, function (data) {
    if (data) {
      dialog.close();
      var href = `/${cur}:${data}${can_preview ? '?a=view' : ''}`;
      dialog = mdui.dialog({
        title: '<i class="mdui-icon material-icons">&#xe815;</i>目標路徑',
        content: `<a href="${href}">${data}</a>`,
        history: false,
        modal: true,
        closeOnEsc: true,
        buttons: [
          {
            text: '打開', onClick: function () {
              window.location.href = href
            }
          }, {
            text: '新頁籤中打開', onClick: function () {
              window.open(href)
            }
          }
          , {text: '取消'}
        ]
      });
      return;
    }
    dialog.close();
    dialog = mdui.dialog({
      title: '<i class="mdui-icon material-icons">&#xe811;</i>無法讀取或找不到目標',
      content: '可能因為硬碟中並不存在此項！',
      history: false,
      modal: true,
      closeOnEsc: true,
      buttons: [
        {text: 'WTF ???'}
      ]
    });
  })
}

function get_file(path, file, callback) {
  var key = "file_path_" + path + file['modifiedTime'];
  var data = localStorage.getItem(key);
  if (data != undefined) {
    return callback(data);
  } else {
    $.get(path, function (d) {
      localStorage.setItem(key, d);
      callback(d);
    });
  }
}


//时间转换
function utc2beijing(utc_datetime) {
  // 转为正常的时间格式 年-月-日 时:分:秒
  var T_pos = utc_datetime.indexOf('T');
  var Z_pos = utc_datetime.indexOf('Z');
  var year_month_day = utc_datetime.substr(0, T_pos);
  var hour_minute_second = utc_datetime.substr(T_pos + 1, Z_pos - T_pos - 1);
  var new_datetime = year_month_day + " " + hour_minute_second; // 2017-03-31 08:02:06

  // 处理成为时间戳
  timestamp = new Date(Date.parse(new_datetime));
  timestamp = timestamp.getTime();
  timestamp = timestamp / 1000;

  // 增加8个小时，北京时间比utc时间多八个时区
  var unixtimestamp = timestamp + 8 * 60 * 60;

  // 时间戳转为时间
  var unixtimestamp = new Date(unixtimestamp * 1000);
  var year = 1900 + unixtimestamp.getYear();
  var month = "0" + (unixtimestamp.getMonth() + 1);
  var date = "0" + unixtimestamp.getDate();
  var hour = "0" + unixtimestamp.getHours();
  var minute = "0" + unixtimestamp.getMinutes();
  var second = "0" + unixtimestamp.getSeconds();
  return year + "-" + month.substring(month.length - 2, month.length) + "-" + date.substring(date.length - 2, date.length)
    + " " + hour.substring(hour.length - 2, hour.length) + ":"
    + minute.substring(minute.length - 2, minute.length) + ":"
    + second.substring(second.length - 2, second.length);
}

// bytes自适应转换到KB,MB,GB
function formatFileSize(bytes) {
  if (bytes >= 1073741824) {
    bytes = (bytes / 1073741824).toFixed(2) + ' GB';
  } else if (bytes >= 1048576) {
    bytes = (bytes / 1048576).toFixed(2) + ' MB';
  } else if (bytes >= 1024) {
    bytes = (bytes / 1024).toFixed(2) + ' KB';
  } else if (bytes > 1) {
    bytes = bytes + ' bytes';
  } else if (bytes == 1) {
    bytes = bytes + ' byte';
  } else {
    bytes = '';
  }
  return bytes;
}

String.prototype.trim = function (char) {
  if (char) {
    return this.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
  }
  return this.replace(/^\s+|\s+$/g, '');
};


// README.md HEAD.md 支持
function markdown(el, data) {
  if (window.md == undefined) {
    //$.getScript('https://cdn.jsdelivr.net/npm/markdown-it@10.0.0/dist/markdown-it.min.js',function(){
    window.md = window.markdownit();
    markdown(el, data);
    //});
  } else {
    var html = md.render(data);
    $(el).show().html(html);
  }
}

// 监听回退事件
window.onpopstate = function () {
  var path = window.location.pathname;
  render(path);
}


$(function () {
  init();
  var path = window.location.pathname;
  /*$("body").on("click", '.folder', function () {
      var url = $(this).attr('href');
      history.pushState(null, null, url);
      render(url);
      return false;
  });

  $("body").on("click", '.view', function () {
      var url = $(this).attr('href');
      history.pushState(null, null, url);
      render(url);
      return false;
  });*/

  render(path);
});
