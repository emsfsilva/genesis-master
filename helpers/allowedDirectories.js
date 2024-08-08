// Objeto com diretórios permitidos para cada omeId
const allowedDirectories = {
    //1: [TEM ACESSO A TODAS AS ROTAS] DPO
        2: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        3: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
            "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
            "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        4: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],
        
        5: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        6: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        7: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        8: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        9: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        10: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        11: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        12: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        13: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        14: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        15: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        16: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        17: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        18: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        19: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        20: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        21: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        22: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        23: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        24: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        25: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        26: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        27: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        28: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        29: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        30: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        31: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        32: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        33: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        34: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        35: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        36: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        37: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        38: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        39: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        40: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        41: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        42: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        43: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        44: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        45: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        46: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        47: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        48: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        49: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        50: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        51: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        52: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        53: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        54: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        55: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        56: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        57: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        58: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        59: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        60: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        61: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        62: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        63: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        64: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        65: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        66: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        67: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        68: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        69: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        70: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        71: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        72: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        73: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        74: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],

        75: ["/unidade/dashboard/","/unidade/unidadepjes/","/unidade/unidadepjes/view/", "/unidade/unidadepjes/escalas", "/unidade/unidadepjes/deleteEscala/",
        "unidade/unidadepjes/gerar-arquivo-xls","/unidade/unidadeprofile","/unidade/unidadeprofile/edit","/unidade/unidadeconsultarEscalas",
        "/unidade/unidadeusers","/unidade/unidadediarias/","/unidade/unidadediarias/view/",],
};

module.exports = allowedDirectories;