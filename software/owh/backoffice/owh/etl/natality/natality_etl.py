import os
from owh.etl.common.etl import ETL
import logging
from owh.etl.common.fixedwidthfile_parser import FixedWidthFileParser
logger = logging.getLogger('natality_etl')

# data mappings config file map for natality data files
data_mapping_configs = {'Natl00us.pb':'nat_2000_2002.json', 'Nat01pb.US':'nat_2000_2002.json', 'NAT02US.PB':'nat_2000_2002.json',
                        'Nat03us.dat': 'nat_2003_2004.json', 'Nat2004us.dat':'nat_2003_2004.json',
                        'Nat2005us.dat': 'nat_2005_2006.json', 'Nat2006us.dat': 'nat_2005_2006.json',
                        'Nat2007us.dat': 'nat_2007_2013.json', 'Nat2008us.dat':'nat_2007_2013.json',
                        'Nat2009usPub.r20131202':'nat_2007_2013.json', 'Nat2010PublicUS.r20131202': 'nat_2007_2013.json',
                        'Nat2011PublicUS.r20131211':'nat_2007_2013.json', 'Nat2012PublicUS.r20131217':'nat_2007_2013.json',
                        'Nat2013PublicUS.r20141016':'nat_2007_2013.json', 'Nat2014PublicUS.c20150514.r20151022.txt':'nat_2014_2015.json',
                        'Nat2015PublicUS.c20160517.r20160907.txt': 'nat_2014_2015.json'}

class NatalityETL (ETL):
    """
        Loads Natality data into ES db
    """
    def __init__(self, configFile):
        ETL.__init__(self, configFile)
        self.create_index(os.path.join(os.path.dirname(__file__), "es_mapping"
                             ,self.config['elastic_search']['type_mapping']), True)

    def perform_etl(self):
        """Load the Natality data"""
        record_count = 0
        self.initialCount = self.get_record_count()

        for f in os.listdir(self.dataDirectory):
            if not os.path.isfile(os.path.join(self.dataDirectory, f)) or f.endswith(".zip") :
                continue

            file_path = os.path.join(self.dataDirectory, f)
            logger.info("Processing file: %s", f)

            # get the corresponding data mapping file
            config_file = os.path.join(self.dataDirectory, 'data_mapping', data_mapping_configs[f])

            if not config_file:
                logger.warn("No mapping available for data file %s, skipping", file_path)
                continue

            natality_parser = FixedWidthFileParser(file_path, config_file)
            while True:
                record  = natality_parser.parseNextLine()
                if not record:
                    break

                if record['residence'] == '4':
                    logger.info("Skipping foreign resident")
                    continue

                del record['residence']

                record_count += 1
                self.batchRepository.persist({"index": {"_index": self.config['elastic_search']['index'],
                                                        "_type": self.config['elastic_search']['type'],
                                                        "_id": record_count}})
                self.batchRepository.persist(record)

            self.batchRepository.flush()
            self.refresh_index()
        self.metrics.insertCount = record_count
        self.updateDsMetadata();
        logger.info("*** Processed %s records from all natality data files", self.metrics.insertCount)

    def updateDsMetadata(self):
        self.loadDataSetMetaData('natality', '2000', os.path.join(self.dataDirectory, 'data_mapping', 'nat_2000_2002.json'))
        self.loadDataSetMetaData('natality', '2001', os.path.join(self.dataDirectory, 'data_mapping', 'nat_2000_2002.json'))
        self.loadDataSetMetaData('natality', '2002', os.path.join(self.dataDirectory, 'data_mapping', 'nat_2000_2002.json'))
        self.loadDataSetMetaData('natality', '2003', os.path.join(self.dataDirectory, 'data_mapping', 'nat_2003_2004.json'))
        self.loadDataSetMetaData('natality', '2004', os.path.join(self.dataDirectory, 'data_mapping', 'nat_2003_2004.json'))
        self.loadDataSetMetaData('natality', '2005', os.path.join(self.dataDirectory, 'data_mapping', 'nat_2005_2006.json'))
        self.loadDataSetMetaData('natality', '2006', os.path.join(self.dataDirectory, 'data_mapping', 'nat_2005_2006.json'))
        self.loadDataSetMetaData('natality', '2007', os.path.join(self.dataDirectory, 'data_mapping', 'nat_2007_2013.json'))
        self.loadDataSetMetaData('natality', '2008', os.path.join(self.dataDirectory, 'data_mapping', 'nat_2007_2013.json'))
        self.loadDataSetMetaData('natality', '2009', os.path.join(self.dataDirectory, 'data_mapping', 'nat_2007_2013.json'))
        self.loadDataSetMetaData('natality', '2010', os.path.join(self.dataDirectory, 'data_mapping', 'nat_2007_2013.json'))
        self.loadDataSetMetaData('natality', '2011', os.path.join(self.dataDirectory, 'data_mapping', 'nat_2007_2013.json'))
        self.loadDataSetMetaData('natality', '2012', os.path.join(self.dataDirectory, 'data_mapping', 'nat_2007_2013.json'))
        self.loadDataSetMetaData('natality', '2013', os.path.join(self.dataDirectory, 'data_mapping', 'nat_2007_2013.json'))
        self.loadDataSetMetaData('natality', '2014', os.path.join(self.dataDirectory, 'data_mapping', 'nat_2014_2015.json'))
        self.loadDataSetMetaData('natality', '2015', os.path.join(self.dataDirectory, 'data_mapping', 'nat_2014_2015.json'))

    def validate_etl(self):
        """ Validate the ETL"""
        expectedCount = (self.initialCount + self.metrics.insertCount)
        if expectedCount != self.get_record_count():
            self.metrics.message = "Number of records in the DB (%d) not same as the number of records expected (%d)" % (self.get_record_count(), expectedCount)
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
    etl = NatalityETL(file(os.path.join(os.path.dirname(__file__), "config.yaml"), 'r'))
    etl.execute()
