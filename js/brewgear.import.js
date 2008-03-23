/*
 * Import BeerXML/BrouwHulpXML/BrouwVisieXML into the model.
 *
 */
 
function load_document(file_name) {
  var doc;
  $.ajax({ url: file_name, dataType: "xml", async: false, success:
    function(xml) {
      doc = xml;
    }
  });
  return doc;
}

/**
 * Match style defined in import XML with styles defined in the database
 * Returns the style ID or undefined if none found.
 */
function match_style(style) {
  rs = db.execute('SELECT style_id FROM style WHERE name = ?', [ $('NAME', style).text() ]);
  try {
    if (rs.isValidRow()) {
      return rs.field(0);  
    }
  } finally {
    rs.close();
  }
}

function match_fermentables(fermentable) {
}

function import_xml(doc) {
  function R(q) {
    var v = $(q, doc).text();
    return parseFloat(v);
  }
  
  function tag(rtag, xmltag) {
    var v = $(xmltag, doc).text();
    $(rtag).val(v);
  }
  
  tag('#name', "RECIPE > NAME");
  
  tag('#klasse', "RECIPE > STYLE > STYLE_LETTER");
  
  /*
      tag("VERSION", 1);
      tag("TYPE", "All Grain");
      if (F('#style')) {
        tag("STYLE", function() {
          tag("NAME", F('#style'));
          tag("CATEGORY", "none");
          tag("VERSION", 1);
          tag("CATEGORY_NUMBER", 1);
          tag("STYLE_LETTER", F('#klasse'));
          tag("STYLE_GUIDE", "Biertypengids Derek Walsh");
          tag("TYPE", "beer");
          tag("OG_MIN", format_number(T('#style-og-min') / 1000, 3));
          tag("OG_MAX", format_number(T('#style-og-max') / 1000, 3));
          tag("FG_MIN", '1.008');
          tag("FG_MAX", '1.018');
          tag("IBU_MIN", format_number(T('#style-ibu-min')));
          tag("IBU_MAX", format_number(T('#style-ibu-max')));
          tag("COLOR_MIN", format_number(ebc_to_srm(T('#style-ebc-min'))));
          tag("COLOR_MAX", format_number(ebc_to_srm(T('#style-ebc-max'))));
          tag("CARB_MIN", format_number(ebc_to_srm(T('#style-c02v-min')), 1));
          tag("CARB_MAX", format_number(ebc_to_srm(T('#style-c02v-max')), 1));
          tag("ABV_MIN", format_number(ebc_to_srm(T('#style-alcohol-min')), 1));
          tag("ABV_MAX", format_number(ebc_to_srm(T('#style-alcohol-max')), 1));
        });
      }
      tag("EQUIPMENT", function() {
        tag("NAME", "My equipment");
        tag("VERSION", "1");
        tag("BOIL_SIZE", format_number(F('#volume-before-boil'), 1));
        tag("BATCH_SIZE", format_number(F('#batch-size'), 1));
        tag("TRUB_CHILLER_LOSS", format_number(F('#loss-after-boil'), 1));
        tag("EVAP_RATE", format_number(100 * F('#evaporation') / F('#volume-before-boil'), 1));
        tag("BOIL_TIME", format_number(F('#boiltime')));
        //tag("LAUTER_DEADSPACE", "0.0");
        //write("    <TYPE_ENERGY>Propane/butane</TYPE_ENERGY>\n");
        //write("    <COST_ENERGY>2.90</COST_ENERGY>\n");
        //write("    <AMOUNT_ENERGY>1.00</AMOUNT_ENERGY>\n");
        //write("    <VOLUME_BOTTLES>0.300</VOLUME_BOTTLES>\n");
        //write("    <COST_BOTTLE>0.12</COST_BOTTLE>\n");
        //write("   <DEBIT_INSTALLATION>13.00</DEBIT_INSTALLATION>\n");
      });
      tag("BREWER", "Joe Sixpack");
      tag("BATCH_SIZE", format_number(F('#batch-size'), 1));
      tag("BOIL_SIZE", format_number(F('#volume-before-boil'), 1));
      tag("BOIL_TIME", format_number(F('#boiltime')));
      tag("EFFICIENCY", format_number(F('#brewhouse-efficiency')));

      tag("HOPS", function() {
        $('.hop').each(function() {
          if (F('[name=hop-name]', this)) {
            var hop = this;
            tag("HOP", function() {
              tag("NAME", F('[name=hop-name]', hop));
              tag("VERSION", "1");
              tag("ALPHA", format_number(F('[name=hop-alpha]', hop), 1));
              tag("AMOUNT", format_number(F('[name=hop-amount]', hop) / 1000, 1));
              tag("USE", "Boil");
              tag("TIME", format_number(F('[name=hop-boiltime]', hop)));
              tag("FORM", "Leaf");
              //write("      <COST>0.00</COST>\n");
            });
          }
        });
      });

      tag("FERMENTABLES", function() {
        $('.malt').each(function() {
          if (F('[name=malt-id]', this)) {
            var malt = this;
            tag("FERMENTABLE", function() {
              tag("NAME", F('[name=malt-name]', malt));
              tag("VERSION", "1");
              tag("TYPE", "Grain");
              tag("AMOUNT", (F('[name=malt-amount]', malt) / 1000));
              tag("YIELD", F('[name=malt-yield]', malt));
              tag("COLOR", ebc_to_srm(F('[name=malt-ebc]', malt)));
              tag("MOISTURE", F('[name=malt-moisture]', malt));
              //write("      <ORIGIN>Belgium</ORIGIN>\n");
              //write("      <COST>0.00</COST>\n");
            });
          }
        });
      });

      tag("MISCS", function() { });

      tag("YEASTS", function() {
        tag("YEAST", function() {
          tag("NAME", F('#yeast'));
          tag("VERSION", "1");
          tag("TYPE", "Ale");
          tag("AMOUNT", format_number(F('#starter'), 1));
          g = F('[name=starter-temp]');
          tag("TEMP", isFinite(g) ? g : 20);
          //write("      <FORM>Liquid</FORM>\n");
          //write("      <AMOUNT_IS_WEIGHT>FALSE</AMOUNT_IS_WEIGHT>\n");
          //write("      <STARTER_MADE>TRUE</STARTER_MADE>\n");
          //write("      <OG_STARTER>1.040</OG_STARTER>\n");
          //write("      <DATE_MADE></DATE_MADE>\n");
          //write("      <TIME_AERATED>0.0</TIME_AERATED>\n");
          //write("      <NUTRIENTS_ADDED>FALSE</NUTRIENTS_ADDED>\n");
          //write("      <NAME_NUTRIENTS></NAME_NUTRIENTS>\n");
          //write("      <AMOUNT_NUTRIENTS>0.0000</AMOUNT_NUTRIENTS>\n");
          //write("      <ZINC_ADDED>FALSE</ZINC_ADDED>\n");
          //write("      <NAME_ZINC></NAME_ZINC>\n");
          //write("      <AMOUNT_ZINC>0.00000</AMOUNT_ZINC>\n");
          //write("      <AMOUNT_PACKS>0.00</AMOUNT_PACKS>\n");
          //write("      <COST>0.00</COST>\n");
          //write("      <AMOUNT_EXTRACT>0.00</AMOUNT_EXTRACT>\n");
          //write("      <COST_EXTRACT>0.00</COST_EXTRACT>\n");
        });
      });

      tag("MASH", function() {
        tag("NAME", "My mash profile");
        tag("VERSION", "1");
        //write("    <GRAIN_TEMP>18.0</GRAIN_TEMP>\n");
        tag("MASH_STEPS", function() {
          $('.step').each(function() {
            if (F('[name=step-name]', this)) {
              var step = this;
              tag("MASH_STEP", function() {
                tag("NAME", F('[name=step-name]', step));
                tag("VERSION", "1");
                tag("TYPE", "Infusion");
                tag("INFUSE_AMOUNT", format_number(F('#volume-mash'), 1));
                tag("STEP_TEMP", format_number(F('[name=step-temp]', step), 1));
                tag("STEP_TIME", format_number(F('[name=step-time]', step)));
                //write("        <RAMP_TIME>1</RAMP_TIME>\n");
                //write("        <END_TEMP>60.0</END_TEMP>\n");
              });
            }
          });
        });
        
        tag("SPARGE_TEMP", "75.0");
      });
      */
      
    tag('#notes', "RECIPE > NOTES");
    
    g = R('RECIPE > OG') * 1000;
    $('#og').val(g);
    
    g = R('RECIPE > FG') * 1000;
    
    $('#fg-secundary').val(g);
    
    tag('#brew-date', "RECIPE > DATE");
    
    tag('#priming-name', "RECIPE > PRIMING_SUGAR_NAME");
     /*
      age = F('[name=start-secundary]') - F('[name=start-primary]');
      age /= 24*60*60*1000;
    tag("PRIMARY_AGE", (isFinite(age) ? age : 0));
      age = F('#bottle-date') - F('[name=start-secundary');
      age /= 24*60*60*1000;
      tag("SECONDARY_AGE", (isFinite(age) ? age : 0));
      tag("AGE_TEMP", "23.0");
      tag("PRIMING_SUGAR_NAME", F('#priming-name'));
      tag("CARBONATION", format_date(F('#co2v'), 1));
      tag("CARBONATION_TEMP", "20.0");
     */
     
     /*
      g = F('#planned-og') / 1000;
      tag("PLANNED_OG", (isFinite(g) ? g.toFixed(3) : ''));
      tag("VOLUME_AFTER_BOIL", F('#volume-after-boil'));
      tag("VOLUME_FERMENTER", F('#volume-fermenter'));
      tag("DATE_BOTTLING", format_date(F('#bottle-date')));
      g = F('#bottle-volume');
      tag("AMOUNT_BOTTLING", (isFinite(g) ? g : ''));
      g = F('#priming-amount') / 1000;
      tag("AMOUNT_PRIMING",  (isFinite(g) ? g : ''));
  
  });
  });
  */
}