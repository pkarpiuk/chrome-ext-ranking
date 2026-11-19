Ext.onReady(function() {
    var lastFun = function(value, metaData, record, rowIndex, colIndex, store, view) {
	return value[value.length-1];
    };
    grid = Ext.create('Ext.grid.Panel', {
	border: false,
	store: Ext.create('Ext.data.ArrayStore', {
	    fields: ['id', 'name', 'author', 'desc', 'category', 'rate', 'rate_users', 'site_url', 'user_count', 'free', 'icon26_url', 'icon128_url', 'image220x140_url']
	}),
	columns: [
            { header: '#', xtype: 'rownumberer', width: 30 },
	    { header: 'Name', width: 250, dataIndex: 'name', renderer: function(value, metaData, record) {
		// icon26_url to numer ikony w sprite'cie (icons-sprite.css; sprite ma COLS kolumn ikon SIZE x SIZE px) albo adres obrazka
		var icon = record.get('icon26_url');
		var iconHtml;
		if( typeof icon === 'number' && chrome_data.icons ) {
		    var ic = chrome_data.icons;
		    iconHtml = '<span class="ic" style="background-position: -' + (icon % ic.cols) * ic.size + 'px -' + Math.floor(icon / ic.cols) * ic.size + 'px;"></span>';
		} else {
		    iconHtml = '<img loading="lazy" src="' + icon + '" style="width: 10px; margin: 0; padding: 0;">';
		}
		return iconHtml + '&nbsp;' + record.get('name');
	    } },
	    { header: 'Change', width: 55, align: 'center', renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
		var newIndex = rowIndex+1;
		var oldIndex = globalCompHash[record.get('id')];
		if( !oldIndex ) {
		    return '<span style="font-size: 80% !important; background-color: yellow;">NEW</span>'
		}
                if( oldIndex < 0 ) {
                    return '?';
                }
		var delta = oldIndex - newIndex;
		if( delta < 0 ) {
		    return '<span style="color: red"><span style="font-size: 16px !important;">&darr;</span> ' + (-delta) + '</span>';
		} else if( delta > 0 ) {
		    return '<span style="color: green"><span style="font-size: 16px !important;">&uarr;</span> ' + delta + '</span>';
		} else {
		    return '&mdash;';
		}
	    } },
	    { header: 'Desc', flex: 1, dataIndex: 'desc' },
	    { header: 'Author', width: 200, dataIndex: 'author' },
	    { header: 'Category', width: 140, dataIndex: 'category', renderer: function(value) { return chrome_data.categories[value]; } },
	    { header: 'Rate', width: 50, dataIndex: 'rate', renderer: function(value){ return value[value.length-1].toFixed(2); }, align: 'right' },
	    { header: 'Rate users', width: 70, dataIndex: 'rate_users', renderer: lastFun, align: 'right' },
	    { header: 'User count', width: 70, dataIndex: 'user_count', renderer: lastFun, align: 'right' },
	    { header: 'Price', width: 150, dataIndex: 'free' }
	],
      listeners: {
	  itemdblclick: function( slf, record, item, index, e, eOpts ) {
	      buttonClick();
	  },
          selectionchange: function (selModel, selected, eOpts) {
	      var record = null;
	      if( selected.length ) {
		  record = selected[0];
	      }
	      setInfoPanel( record );
          }
      }
    });
    Ext.create( 'Ext.container.Viewport', {
	border: false,
	renderTo: Ext.getBody(),
	layout: 'border',
	items: [
	    {
		region: 'north',
		height: 60,
		border: false,
		html: '<div id="banner"><div>Google Chrome Extensions Ranking (v. ' + chrome_data.dates[chrome_data.dates.length-1] + ')</div>' + '<button id="helpBtn" class="helpbtn" type="button" aria-haspopup="dialog" aria-controls="help" aria-label="Help: user manual" title="Help: user manual">?</button></div>'
	    },
	    {
		region: 'center',
		layout: 'fit',
		dockedItems: [
		    {
			itemId: 'toolbar',
			xtype: 'toolbar',
			dock: 'top',
			defaultButtonUI: 'default',
			items: [

			    'Category',
			    {
				id: 'category-field',
				xtype: 'combo',
				queryMode: 'local',
				editable: false,
				width: 160,
				autoSelect: true,
				submitEmptyText: false,
				triggerAction: 'all',
				value: 0,
				store: [[0, 'All']].concat(Object.keys(chrome_data.categories).sort().map(function(value){ return [value, chrome_data.categories[value]]; })),
				listeners: {
				    change: function (slf, newValue, oldValue, eOpts) {
					refresh();
				    }
				}
			    },
			    ' ',
			    'Sort by',
			    {
				id: 'sort-field',
				xtype: 'combo',
				queryMode: 'local',
				editable: false,
				width: 130,
				autoSelect: true,
				submitEmptyText: false,
				triggerAction: 'all',
				value: 'rate*rate-users',
				store: [['rate*rate-users', 'Rate * Rate users'], ['user-count', 'User count, Rate'], ['rate*user-count', 'Rate * User count'], ['rate', 'Rate, User count']],
				listeners: {
				    change: function (slf, newValue, oldValue, eOpts) {
					refresh();
				    }
				}
			    },
			    ' ',
			    'Price',
			    {
				id: 'price-field',
				xtype: 'combo',
				queryMode: 'local',
				editable: false,
				width: 90,
				autoSelect: true,
				submitEmptyText: false,
				triggerAction: 'all',
				value: 'any',
				store: [['any', 'Any'], ['free', 'Free'], ['non-free', 'Non-free']],
				listeners: {
				    change: function (slf, newValue, oldValue, eOpts) {
					refresh();
				    }
				}
			    },
			    ' ',
			    'Compare to',
			    {
				id: 'compare-field',
				xtype: 'combo',
				queryMode: 'local',
				editable: false,
				width: 90,
				autoSelect: true,
				submitEmptyText: false,
				triggerAction: 'all',
				value: chrome_data.dates[chrome_data.dates.length-2],
				store: chrome_data.dates.slice(0,-1),
				listeners: {
				    change: function (slf, newValue, oldValue, eOpts) {
					refresh();
				    }
				}
			    },
			    '->',
			    'Search in',
			    {
				id: 'search-in-field',
				xtype: 'combo',
				queryMode: 'local',
				editable: false,
				width: 100,
				autoSelect: true,
				submitEmptyText: false,
				triggerAction: 'all',
				value: 'name+desc',
				store: [['name', 'Name'], ['name+desc', 'Name+Desc'], ['desc', 'Desc'], ['author', 'Author']]
			    },
			    'Phrase',
			    { id: 'phrase-field', xtype: 'textfield', width: 200,
			      listeners: {
				  specialkey: function (field, e) {
				      if (e.getKey() == e.ENTER) {
					  refresh( true );
				      }
				  }
			      }
			    },
			    { xtype: 'button', text: 'Clear', handler: function() { Ext.getCmp('phrase-field').reset(); refresh( true ); } },
			    { xtype: 'button', text: '<b>Search</b>', handler: function() { refresh( true ); } },
			]}],
		items: grid,
		bbar: [
		    { id: 'status-bar', xtype: 'tbtext', text: '&nbsp;' },
		    '->',
		    { id: 'status-bar2', xtype: 'tbtext', text: '&nbsp;' },
		],
	    },
	    {
		id: 'info-panel',
		region: 'east',
		width: 310,
		autoScroll: true,
		bodyPadding: 10
	    }
	],
	listeners: {
            afterrender: {
		fn: function () {
		    refresh();
		},
		single: true
            }
	}
    });
});

var globalCompHash = {};
function refresh(searchFlag) {
    var catId = Ext.getCmp('category-field').getValue();
    var sortType = Ext.getCmp('sort-field').getValue();
    var priceType = Ext.getCmp('price-field').getValue();
    var phrase = Ext.getCmp('phrase-field').getValue();
    var searchIn = Ext.getCmp('search-in-field').getValue();
    var statusBar = Ext.getCmp('status-bar');
    var statusBar2 = Ext.getCmp('status-bar2');
    var compareIdx = chrome_data.dates.indexOf(Ext.getCmp('compare-field').getValue());
    var data = chrome_data.data;
    console.info( 'COMPARE IDX', compareIdx );
    var lastIdx = chrome_data.dates.length-1;
    // Rozszerzenia usunięte ze sklepu mają dane tylko ze starszych dat. Zostają w danych, bo liczą się w rankingach
    // historycznych (porównanie), ale nie pokazujemy ich w rankingu bieżącym.
    var isCurrent = function(rec) { return !!rec[5][lastIdx]; };
    statusBar2.setText('Last update: <b>' + chrome_data.dates[lastIdx] + '</b>&nbsp;&nbsp; All records: <b>' + data.filter(isCurrent).length + '</b>');
    setInfoPanel(null);
    if( phrase ) {
	phrase = phrase.toLowerCase();
	var fields = [];
	switch( searchIn ) {
	case 'name': fields = [1]; break;
	case 'name+desc': fields = [1,3]; break;
	case 'desc': fields = [3]; break;
	case 'author': fields = [2]; break;
	}
	data = data.filter(function(rec) {
	    for(var i = 0; i < fields.length; i++ ) {
		var fieldId = fields[i];
		if(rec[fieldId].toLowerCase().indexOf(phrase) >= 0) {
		    return true;
		}
	    }
	    return false;
	});
    }
    if( catId > 0 ) {
	data = data.filter(function(rec) { return rec[4] == catId; } );
    }
    switch(priceType) {
    case 'free':
	data = data.filter(function(rec) { return rec[9] == 'Free'; } );
	break;
    case 'non-free':
	data = data.filter(function(rec) { return rec[9] != 'Free'; } );
	break;
    default:
	break;
    }
    var sortFun = null;
    var allData = data;   // po filtrach, razem z rozszerzeniami usuniętymi ze sklepu
    switch(sortType) {
    case 'rate*user-count':
	sortFun = function(data, idx) {
	    return data.sort(function(r1, r2) {
		return r2[5][idx]*r2[8][idx] - r1[5][idx]*r1[8][idx];
	    });
	};
	break;
    case 'rate':
	sortFun = function(data, idx) {
	    return data.sort(function(r1, r2) {
		var result = r2[5][idx] - r1[5][idx];
		if( result == 0 ) {
		    result = r2[8][idx] - r1[8][idx];
		}
		return result;
	    });
	};
	break;
    case 'rate*rate-users':
	sortFun = function(data, idx) {
	    return data.sort(function(r1, r2) {
		return r2[5][idx]*r2[6][idx] - r1[5][idx]*r1[6][idx];
	    });
	}
	break;
    case 'user-count':
	sortFun = function(data, idx) {
	    return data.sort(function(r1, r2) {
		var result = r2[8][idx] - r1[8][idx];
		if( result == 0 ) {
		    result = r2[5][idx] - r1[5][idx];
		}
		return result;
	    });
	}
	break;
    }
    data = sortFun(data.filter(isCurrent), lastIdx);
    var data2 = allData.filter(function(rec) {
	return !!rec[5][compareIdx];
    });
    console.info('DATA2.LENGTH', data2.length);
    data2 = sortFun(data2, compareIdx);
    globalCompHash = {};
    for( var i = 0; i < data2.length; i++ ) {
        globalCompHash[data2[i][0]] = i+1;
    }
    var filteredCount = data.length;
    var maxRecords = 500;
    data = data.slice( 0, maxRecords );
    statusBar.setText('Filtered records: <b>' + filteredCount + '</b>&nbsp;&nbsp; Shown records: <b>' + data.length + '</b>');
    grid.getStore().loadData(data);
}

function setInfoPanel( record ) {
    var panel = Ext.getCmp('info-panel');
    var html = '';
    var appLinkFun = function( text ) {
	// adres strony w sklepie budujemy z id (sklep przekierowuje na adres ze slugiem)
	var url = 'https://chromewebstore.google.com/detail/' + record.get('id');
	globalAppURL = url;
	return '<a target="_blank" href="' + url + '">' + text + '</a>';
    }
    if( record ) {
	if( record.get('image220x140_url') ) {
	    html += '<div style="text-align: center; height: 140px;">' + appLinkFun('<img style="width: 220px; height: 140px;" src="' + record.get('image220x140_url') + '">') + '</div>';
	} else {
	    html += '<div style="text-align: center; height: 140px;">' + appLinkFun('<img style="width: 128px; height: 128px;" src="' + record.get('icon128_url') + '">') + '</div>';
	}
	html += appLinkFun( '<h3 style="text-align: center; height: 30px;">' + record.get('name') + '</h3>' );
	html += '<table style="max-width: 100%;">';
	var keys = {
	    id: null,
	    author: function( value ) { return record.get('site_url') ? '<a target="_blank" href="' + record.get('site_url') + '">' + value + '</a>' : value; },
	    category: function( value ) { return chrome_data.categories[value]; },
	    rate: function( value ) { return value[value.length-1].toFixed(2); },
	    rate_users: function( value ) { return value[value.length-1]; },
	    user_count: function( value ) { return value[value.length-1]; },
	    free: null
	};
	var key2name = {
	    free: 'price'
	}
	for( var key in keys ) {
	    var fun = keys[key];
	    var value = record.get(key);
	    if( fun ) { value = fun(value); }
	    html += '<tr><th style="text-align: right; min-width: 60px;">' + (key2name[key] || key).replace(/_/g,' ') + '</th><td style="max-width: 210px; white-space: nowrap; overflow: hidden !important; text-overflow: ellipsis !important;">' + value + '</td></tr>';
	}
	html += '</table>';
	html += '<div style="text-align: center"><input type="button" value="Go to extension page" onclick="buttonClick()"></input></div>';
	html += '<p style="font-family: sans-serif !important; font-size: 14px;">' + record.get('desc') + '</p>';
    } else {
	globalAppURL = null;
    }
    panel.update( html );
}

function buttonClick() {
    if( globalAppURL ) {
	var win = window.open( globalAppURL, '_blank' );
	win.focus();
    }
}

// Help: the "?" button in the title bar opens the user manual (<dialog id="help"> in index.html); Esc, the X button and a click on the backdrop close it.
document.addEventListener('click', function (e) {
    var dlg = document.getElementById('help');
    if (!dlg) { return; }
    if (e.target.closest && e.target.closest('#helpBtn')) {
	dlg.showModal();
	document.getElementById('helpBody').scrollTop = 0;
    } else if (e.target.closest && e.target.closest('#helpClose')) {
	dlg.close();
    } else if (e.target === dlg) {
	dlg.close();   // click on the backdrop (the dialog has no padding, so only the backdrop hits the dialog element itself)
    }
});
