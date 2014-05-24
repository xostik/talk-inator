var require = {
        baseUrl: '/js',


        shim: {
            jquery: {
                exports: 'jquery'
            },
            underscore: {
                exports: '_'
            },
            backbone: {
                exports: 'Backbone',
                deps: ['underscore', 'jquery']
            },
            aspic: {
                deps: ['underscore', 'backbone']
            },
            'jquery.ui.widget': {
                deps: ['jquery']
            },
            'google-geocomplite': {
                exports: 'google'
            }
        },


        paths: {
            'app':      'app/app',      // старт приложения
            'routes':   'app/routes',   // роуты приложения
            'router':   'app/router',   // роутер приложения

            'layout-manager':       'app/core/layout-manager',      // управляет заполнением абстрактных слоев абстрактными вьюхами
            'async-data-models':    'app/core/async-data-models',   // базовые классы моделей, чьи данные берутся удаленно
            'abstract-layout':      'app/core/abstract-layout',
            'abstract-region':      'app/core/abstract-region',

            'start':        'app/bootstrap-states/start',
            'talk':         'app/bootstrap-states/talk',

            'simple-layout':    'app/base-entities/layouts/simple-layout',
            'common-layout':    'app/base-entities/layouts/common-layout',

            'empty-region':             'app/base-entities/models/empty-region',
            'post':                     'app/base-entities/models/post',
            'abstract-comments':        'app/base-entities/models/abstract-comments',
            'vk-comments':              'app/base-entities/models/vk-comments',
            'comments-tree':            'app/base-entities/models/comments-tree',
            'talk-region':              'app/base-entities/models/talk-region',
            'vk-talk-loader':           'app/base-entities/models/vk-talk-loader',

            'header-region-view':   'app/base-entities/regions/header-region',
            'footer-region-view':   'app/base-entities/regions/footer-region',
            'start-region-view':    'app/base-entities/regions/start-region',
            'talk-region-view':     'app/base-entities/regions/talk-region',

            'talk-items-views':     'app/base-entities/regions/talk-items',

            'user':         'app/user/user',         //  работа с пользователями
            'user-models':  'app/user/user-models',  //  модели пользователей
            'user-tasks':   'app/user/user-tasks',   //  выполнение запросов о пользователях к серверу

            // МОДУЛИ

            // УТИЛИТЫ
            'utils':                    'app/utils/utils',
            'when-ready-for-group':     'app/utils/when-ready-for-group',


            // СТОРОННИЕ СКРИПТЫ
            'jquery':               'http://code.jquery.com/jquery-1.10.2.min',
            'text':                 'lib/require/text.require',
            'underscore':           'lib/underscore/underscore',
            'backbone':             'lib/backbone/backbone',
            'aspic':                'lib/backbone/aspic',
            'jquery.ui.widget':     'lib/file-uploader/jquery.ui.widget',
            'fileuploader':         'lib/file-uploader/jquery.fileupload',
            'google-geocomplite':   'http://maps.googleapis.com/maps/api/js?sensor=false&amp;libraries=places'
        },


        urlArgs: 'bust=' + (new Date()).getTime()
    },


    requirePaths = {
        // шаблоны
        'simple-layout.tpl':    'text!/js/app/base-entities/templates/simple-layout.tpl.html',
        'common-layout.tpl':    'text!/js/app/base-entities/templates/common-layout.tpl.html',

        'start-region.tpl':     'text!/js/app/base-entities/templates/start-region.tpl.html',
        'talk-region.tpl':      'text!/js/app/base-entities/templates/talk-region.tpl.html',
        'header-region.tpl':    'text!/js/app/base-entities/templates/header-region.tpl.html',
        'footer-region.tpl':    'text!/js/app/base-entities/templates/footer-region.tpl.html',
        'comment.tpl':          'text!/js/app/base-entities/templates/comment.tpl.html',
        'post.tpl':             'text!/js/app/base-entities/templates/post.tpl.html',
        'ship-region.tpl':      'text!/js/app/base-entities/templates/ship-region.tpl.html',
        'map-region.tpl':       'text!/js/app/base-entities/templates/map-region.tpl.html'

    },

    config = {
        COMMENT_REQUEST_PERIOD: 400,
        MIN_REQUEST_PERIOD: 400,
        PING_NEW_COMMENT_PERIOD: 5000
    };