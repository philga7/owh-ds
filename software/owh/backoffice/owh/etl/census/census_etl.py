import os
from random import randint
from owh.etl.common.etl import ETL
import logging
from owh.etl.common.fixedwidthfile_parser import FixedWidthFileParser
logger = logging.getLogger('mortality_etl')

class CensusETL (ETL):
    """
        Loads Bridge race census data into ES db
    """
    def __init__(self, configFile):
        ETL.__init__(self, configFile)
        self.create_index(os.path.join(os.path.dirname(__file__), "es_mapping"
                             ,self.config['elastic_search']['type_mapping']), True)
        self.savedreccount = 0
        self.processreccount = 0

    def _persistStateRecords(self, stateAggregatedRecods):
        """
            Persist aggregrated state census data ino
        """
        for key, value in stateAggregatedRecods.iteritems():
            self.savedreccount += 1
            self.batchRepository.persist({"index": {"_index": self.config['elastic_search']['index'], "_type": self.config['elastic_search']['type'], "_id": self.savedreccount}})
            self.batchRepository.persist(value)
        self.batchRepository.flush()

    def perform_etl(self):
        """Perform the mortality ETL"""
        counter = 0
        for f in os.listdir(self.dataDirectory):
            if not f.endswith(".txt"):
                continue
            file_path = os.path.join(self.dataDirectory, f)
            logger.info("Processing file: %s", f)
            config_file =  os.path.join(self.dataDirectory, 'data_mapping',f.replace(".txt", ".json"))
            sensusParser = FixedWidthFileParser(file_path, config_file)
            stateAggregatedRecods = {}
            curState = None
            while True:
                record  = sensusParser.parseNextLine()
                if not record:
                    # reached end of the file, persist the aggregated data and break
                    self._persistStateRecords(stateAggregatedRecods)
                    break;
                self.processreccount += 1
                newState = record[0]['state']
                if curState != newState:
                     # once the state id changes, persist the current state records, and start aggregating next state data
                     curState = newState
                     self._persistStateRecords(stateAggregatedRecods)
                     stateAggregatedRecods = {}

                for row in record:
                    aggkey = '{:4s}{:1s}{:1d}{:1d}{:02d}'.format(row['year'],row['sex'],row['race'],row['hispanic_origin'],row['age'])
                    # if the key is not yet in the aggdata, add the key and data, else aggr population
                    if not stateAggregatedRecods.has_key(aggkey):
                        stateAggregatedRecods[aggkey] = row
                    else:
                        stateAggregatedRecods[aggkey]['pop'] += row['pop']
        self.metrics.insertCount = self.savedreccount
        logger.info("*** Processed %s records from all census data files", self.processreccount)


    def validate_etl(self):
        """ Validate the ETL"""
        if self.metrics.insertCount != self.get_record_count():
            self.metrics.message = "Number of records in the DB (%d) not same as the number of records inserted (%d)" % (self.get_record_count(), self.metrics.insertCount)
            return False
        if self.get_record_by_id(1) is None:
            self.metrics.message = "Record 1 is None"
            return False
        if self.get_record_by_id(self.get_record_count()) is None:
            self.metrics.message = "Last record is None"
            return False
        return True

if __name__ == "__main__":
    # Perform ETL
    etl = CensusETL(file(os.path.join(os.path.dirname(__file__), "config.yaml"), 'r'))
    etl.execute()