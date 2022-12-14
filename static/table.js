$(document).ready(function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const compressed_config = urlParams.get('config');
    const config = JSON.parse(LZString.decompressFromEncodedURIComponent(compressed_config));
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
    })

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
            colorizeColumn(additional_headers.length, displayed_columns, o.title, o.heatmap, o.scale, config.detail_mode, config.header_label_length);
        }
    }

    for (o of config.ellipsis) {
        if (displayed_columns.includes(o.title)) {
            shortenColumn(additional_headers.length, displayed_columns, o.title, o.ellipsis, config.detail_mode, config.header_label_length);
        }
    }
}