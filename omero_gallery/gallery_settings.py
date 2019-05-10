#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Copyright (C) 2019 University of Dundee & Open Microscopy Environment.
# All rights reserved.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

"""Settings for the OMERO.gallery app."""

import sys
from omeroweb.settings import process_custom_settings, report_settings
import json

# load settings
GALLERY_SETTINGS_MAPPING = {

    "omero.web.gallery.base_url":
        ["BASE_URL",
         'https://idr.openmicroscopy.org',  # TODO: - should be None
         str,
         ("Base URL to use for JSON AJAX requests."
          "This allows data to be loaded from another OMERO server."
          "The default behaviour is to use the current server.")],

    "omero.web.gallery.category_queries":
        ["CATEGORY_QUERIES",
         ('{'
          '"latest": {"label": "Most Recent", "index": 0, "query":'
          ' "FIRST10:date"},'
          '"timelapse": {"label": "Time-lapse", "index": 1, "query":'
          ' "Study Type:time OR Study Type:5D OR Study Type:3D-tracking"},'
          '"lightsheet": {"label": "Light sheet", "index": 2, "query":'
          ' "Study Type:light sheet"},'
          '"proteinlocalization": {"label": "Protein localization",'
          '"index": 3, "query": "Study Type:protein localization"},'
          '"histology": {"label": "Histology", "index": 4, "query":'
          ' "Study Type:histology"},'
          '"yeast": {"label": "Yeast", "index": 5, "query": "Organism:'
          'Saccharomyces cerevisiae OR Organism:Schizosaccharomyces pombe"},'
          '"humancellscreen": {"label": "Human Cell Screen", "index": 6, '
          '"query": "Organism:Homo sapiens AND'
          ' Study Type:high content screen"}'
          '}'),    # TODO: - should be {}
         json.loads,
         ("If this is configured then the gallery Home Page shows a list"
          " of categories containing Projects and Screens that match the"
          " relevant query. Query is by Key:Value on Map Annotations linked"
          " to Projects and Screens, or e.g. 'FIRST5:Name' or 'LAST10:date"
          " to sort by Name or date.")],

    "omero.web.gallery.filter_keys":
        ["FILTER_KEYS",
         ('['
          '"Imaging Method", "Organism", "Publication Authors",'
          ' "Publication Title", "Screen Technology Type",'
          ' "Screen Type", "Study Type"'
          ']'),
         json.loads,
         ("If this is configured then we allow filtering of Screens and"
          " Projects by Key:Value pairs linked to them. This list allows us"
          " to specify which Keys the user can choose in the UI.")],

    "omero.web.gallery.filter_mapr_keys":
        ["FILTER_MAPR_KEYS",
         ('['
          '"antibody", "cellline", "gene", "phenotype", "sirna"'
          ']'),
         json.loads,
         ("If this is configured then we allow filtering of Screens and"
          " Projects by OMERO.mapr. This is a list of mapr_config IDs, such"
          " as 'gene', 'antibody' etc. which allows us"
          " to specify which Keys the user can choose in the UI.")],

    "omero.web.gallery.super_categories":
        ["SUPER_CATEGORIES",
         ('{'
          '"cells": {"label": "Cells - IDR",'
          ' "query": "Study Type:NOT histology", "image":'
          ' "https://idr.openmicroscopy.org/webgateway/'
          'render_image/122770/0/0/"},'
          '"tissue": {"label": "Tissue - IDR", '
          ' "query": "Study Type:histology",'
          ' "image": "https://idr.openmicroscopy.org/webgateway/'
          'render_image_region/5470164/0/0/?region=1024,1024,696,520"}'
          '}'),    # TODO: - should be {}
         json.loads,
         ("If category_queries has been set, we can create top-level"
          " super-categories that contain them. The 'categories' is a list"
          " of category IDs from the category_queries OR can be 'other'"
          " to include all categories not listed in other super_categories")]

}

process_custom_settings(sys.modules[__name__], 'GALLERY_SETTINGS_MAPPING')
report_settings(sys.modules[__name__])