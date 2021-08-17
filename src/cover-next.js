import Head from "./modules/head";
import PassData from "./modules/pass-data";
import Cover from "./modules/cover";
import Button from "./modules/button";
import Download from "./modules/download";
import HookDetail from "./modules/hook-detail";
import Cache from "./cache";
import Setting from "./setting";
import Thank from "./modules/thank";
import Clean from "./modules/clean";
import Album from "./modules/album";
import Detail from "./modules/detail";
import './template';

//setting
Setting.load();

//working
if ([
    '/viewno18.php',
    '/viewbr.php',
    '/upfinish.php',
].includes(window.location.pathname)) {
    let tr   = $('.mainouter center>table[width=\'100%\'] tr');
    let head = new Head({ element : tr.get(0), itemLength : tr.length });
    let rows = [];

    //remove head row
    tr.splice(0, 1);

    //loop row
    tr.each(( index, item ) => {
        let data = new PassData({ element : item, head });

        //hook detail
        let thank = new Thank({ data });
        data.hook = new HookDetail({
            data : data, hook : [
                { callback : thank.hook, self : thank },
                { callback : Download.downloadedHook, self : data }
            ]
        });

        //cover
        let cover = new Cover({
            cover : data.cover,
            data,
        });

        //add column cover
        if (Setting.preview === true) {
            $(data.td.get(0)).after(cover.html);
        }

        //button
        let button = new Button({ data, cover });

        //add column cover
        $(data.td.get(1)).append(button.html);

        //downloaded
        if (Cache.downloaded[ data.detailId ] !== undefined) Download.downloaded({ data });

        //row
        rows.push({
            data   : data,
            cover  : cover,
            thank  : thank,
            button : button,
        });
    });

    //album
    if (Setting.album === true) {
        new Album({ rows });
    }

    //hook every details
    if (Setting.downloadedHook === true) {
        rows.map(async ( { data } ) => {
            let detail = new Detail({
                html     : null,
                location : data.detailLink
            });

            //skip when have cache in 10 min
            if (Cache.detail[ detail.id ] && Cache.detail[ detail.id ] + Setting.cacheDownloadedHookTimeout > Cache.timestamp()) {
                return;
            }

            await data.hook.detail();

            //cache detail
            Cache.set({ key : 'detail', data : { key : detail.id, value : Cache.timestamp() } });
        });
    }
}
//detail
if (window.location.pathname === '/details.php') {
    let detail = new Detail({
        html     : document.body,
        location : window.location,
    });

    //add id to table detail
    detail.table.attr('id', 'detail');

    //fix image over screen
    if (Setting.fixImageOverScreen === true) {
        detail.table.attr('class', 'fix-image-over-screen');
    }

    //auto thank
    if (Setting.autoThankInDetail === true) {
        Thank.thankInDetail(detail.table);
    }

    //downloaded
    Download.downloadedDetail({ html : detail.html, detail : detail });

    //clean
    let clean = new Clean({ element : detail.table });
}