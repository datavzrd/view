$(document).ready(function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const compressed_config = urlParams.get('config');
    const jsonm_config = JSON.parse(LZString.decompressFromEncodedURIComponent(compressed_config));
    const unpacker = new jsonm.Unpacker();
    let config = unpacker.unpack(jsonm_config);
    $('.table-container').show();
    $('.loading').hide();
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });
    $(function () {
        $('[data-toggle="popover"]').popover()
    });
    let columns = [];

    for (const column of config.displayed_columns) {
        columns.push({
            "field": column,
            "title": column,
        });
    }

    $('#table').bootstrapTable({
        columns: columns,
        detailView: config.detail_mode,
        detailFormatter: "detailFormatter"
    })

    // Create new hidden html div to append to view and attach config to it as data attribute
    let config_div = document.createElement("div");
    config_div.id = "config";
    config_div.style.display = "none";
    config_div.setAttribute("data-config", JSON.stringify(config));
    document.body.appendChild(config_div);


    $('#table').bootstrapTable('append', config.data);

    render("", config.displayed_columns, config.data, columns, config);
});

function render(additional_headers, displayed_columns, table_rows, columns, config) {
    for (o of config.ticks) {
        if (displayed_columns.includes(o.title)) {
            renderTickPlot(additional_headers.length, displayed_columns, o.title, o.slug_title, o.specs, o.is_float, o.precision, config.detail_mode, config.header_label_length);
        }
    }

    for (o of config.bars) {
        if (displayed_columns.includes(o.title)) {
            renderBarPlot(additional_headers.length, displayed_columns, o.title, o.slug_title, o.specs, o.is_float, o.precision, config.detail_mode, config.header_label_length);
        }
    }

    for (o of config.link_urls) {
        if (displayed_columns.includes(o.title)) {
            linkUrlColumn(additional_headers.length, displayed_columns, columns, o.title, o.url, config.detail_mode, config.header_label_length);
        }
    }

    for (o of config.heatmaps) {
        if (displayed_columns.includes(o.title)) {
            colorizeColumn(additional_headers.length, displayed_columns, o, config.detail_mode, config.header_label_length);
        }
    }

    for (o of config.ellipsis) {
        if (displayed_columns.includes(o.title)) {
            shortenColumn(additional_headers.length, displayed_columns, o.title, o.ellipsis, config.detail_mode, config.header_label_length);
        }
    }
}

function detailFormatter(index, row) {
    // Load config object from hidden div
    let config = JSON.parse(document.getElementById("config").getAttribute("data-config"));

    let cp = [];
    let ticks = config.tick_titles;
    let bars = config.bar_titles;
    let displayed_columns = config.displayed_columns;
    let hidden_columns = config.hidden_columns;
    var html = []
    $.each(row, function (key, value) {
        if (!hidden_columns.includes(key) && !displayed_columns.includes(key) && key !== "linkouts" && key !== "share") {
            if (cp.includes(key) || ticks.includes(key) || bars.includes(key)) {
                if (cp.includes(key)) {
                    id = `detail-plot-${index}-cp-${cp.indexOf(key)}`;
                } else if (bars.includes(key)) {
                    id = `detail-plot-${index}-bars-${bars.indexOf(key)}`;
                } else {
                    id = `detail-plot-${index}-ticks-${ticks.indexOf(key)}`;
                }
                var card = `<div class="card">
                   <div class="card-header">
                     ${key}
                   </div>
                   <div class="card-body">
                     <div id="${id}"></div>
                   </div>
                 </div>`;
                html.push(card);
            } else if (config.heatmap_titles.includes(key)) {
                id = `heatmap-${index}-${config.heatmap_titles.indexOf(key)}`;
                var card = `<div class="card">
                  <div class="card-header">
                    ${key}
                  </div>
                  <div id="${id}" class="card-body">
                    ${value}
                  </div>
                </div>`;
                html.push(card);
            } else {
                var card = `<div class="card">
                   <div class="card-header">
                     ${key}
                   </div>
                   <div class="card-body">
                    ${value}
                   </div>
                 </div>`;
                html.push(card);
            }
        }
    })
    return `<div class="d-flex flex-wrap">${html.join('')}</div>`
}